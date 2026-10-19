'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const {
  buildAuthorizationUrl,
  createPkce,
  validateAccessToken,
} = require('../src/sso.cjs');
const { resolveSolarSystems, planRoute, searchLocations } = require('../src/esi.cjs');
const { REQUIRED_SCOPES } = require('../src/constants.cjs');
const { isTrustedRendererEvent, trustedRendererUrl } = require('../src/ipc-security.cjs');
const { LocalStore } = require('../src/store.cjs');

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('UI language defaults to Chinese and persists English without affecting app data', async () => {
  const testRoot = path.join(__dirname, '..', 'work', 'test-temp');
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'moway-language-'));
  const filePath = path.join(directory, 'navigator-data.json');
  const safeStorage = { isEncryptionAvailable: () => true };
  try {
    const store = new LocalStore(filePath, safeStorage);
    const initial = await store.load();
    assert.equal(initial.settings.language, 'zh-CN');
    const updated = await store.saveLanguage('en');
    assert.equal(updated.settings.language, 'en');
    await assert.rejects(store.saveLanguage('fr'), (error) => error.code === 'LANGUAGE_INVALID');
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('PKCE authorization URL contains minimal scopes and no secret', () => {
  const pkce = createPkce();
  const url = new URL(buildAuthorizationUrl({
    authorizationEndpoint: 'https://login.eveonline.com/v2/oauth/authorize',
    clientId: 'public-client-id',
    challenge: pkce.challenge,
    state: pkce.state,
  }));

  assert.equal(url.searchParams.get('client_id'), 'public-client-id');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.deepEqual(url.searchParams.get('scope').split(' '), REQUIRED_SCOPES);
  assert.equal(url.searchParams.has('client_secret'), false);
  assert.ok(pkce.verifier.length >= 43);
  assert.ok(pkce.state.length >= 32);
});

test('JWT validation verifies signature, audience, identity and scopes', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicJwk = publicKey.export({ format: 'jwk' });
  publicJwk.kid = 'test-key';
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test-key' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'https://login.eveonline.com/',
    aud: ['EVE Online', 'public-client-id'],
    exp: Math.floor(Date.now() / 1000) + 600,
    sub: 'CHARACTER:EVE:90000001',
    name: 'Secure Pilot',
    scp: REQUIRED_SCOPES,
  })).toString('base64url');
  const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url');
  const token = `${header}.${payload}.${signature}`;
  const fetchImpl = async (url) => {
    if (String(url).includes('.well-known')) {
      return jsonResponse({
        authorization_endpoint: 'https://login.eveonline.com/v2/oauth/authorize',
        token_endpoint: 'https://login.eveonline.com/v2/oauth/token',
        jwks_uri: 'https://login.eveonline.com/oauth/jwks',
      });
    }
    return jsonResponse({ keys: [publicJwk] });
  };

  const identity = await validateAccessToken(token, 'public-client-id', fetchImpl);
  assert.equal(identity.characterId, '90000001');
  assert.equal(identity.name, 'Secure Pilot');
  assert.deepEqual(identity.scopes, REQUIRED_SCOPES);
});

test('exact solar system resolution rejects unknown names', async () => {
  const fetchImpl = async () => jsonResponse({ systems: [{ id: 30000142, name: 'Jita' }] });
  const found = await resolveSolarSystems(['Jita'], { fetchImpl });
  assert.deepEqual(found, [{ id: 30000142, name: 'Jita' }]);
  await assert.rejects(
    resolveSolarSystems(['Not A System'], { fetchImpl }),
    (error) => error.code === 'SYSTEM_NOT_FOUND',
  );
});

test('multi-leg route planning merges duplicate leg boundaries', async () => {
  const fetchImpl = async (url, options) => {
    const pathname = new URL(url).pathname;
    if (pathname === '/universe/ids') {
      return jsonResponse({ systems: [
        { id: 1, name: 'Alpha' }, { id: 3, name: 'Gamma' }, { id: 5, name: 'Omega' },
      ] });
    }
    if (pathname === '/route/1/3') return jsonResponse({ route: [1, 2, 3] });
    if (pathname === '/route/3/5') return jsonResponse({ route: [3, 4, 5] });
    if (pathname === '/universe/names') {
      const ids = JSON.parse(options.body);
      return jsonResponse(ids.map((id) => ({ id, name: `System ${id}`, category: 'solar_system' })));
    }
    return jsonResponse({ error: 'Unexpected request' }, 500);
  };
  const route = await planRoute({
    stopNames: ['Alpha', 'Gamma', 'Omega'],
    preference: 'Shorter',
    securityPenalty: 50,
  }, { fetchImpl });

  assert.equal(route.jumps, 4);
  assert.deepEqual(route.expandedRoute.map((system) => system.id), [1, 2, 3, 4, 5]);
});

test('NPC station remains the final waypoint while routing by its solar system', async () => {
  const stationId = 60003760;
  const fetchImpl = async (url, options) => {
    const pathname = new URL(url).pathname;
    if (pathname === '/universe/ids') {
      return jsonResponse({
        systems: [{ id: 30002187, name: 'Amarr' }],
        stations: [{ id: stationId, name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant' }],
      });
    }
    if (pathname === `/universe/stations/${stationId}`) {
      return jsonResponse({ name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant', system_id: 30000142 });
    }
    if (pathname === '/route/30002187/30000142') {
      return jsonResponse({ route: [30002187, 30000142] });
    }
    if (pathname === '/universe/names') {
      const ids = JSON.parse(options.body);
      return jsonResponse(ids.map((id) => ({ id, name: `System ${id}`, category: 'solar_system' })));
    }
    return jsonResponse({ error: 'Unexpected request' }, 500);
  };
  const route = await planRoute({
    stopNames: ['Amarr', 'Jita IV - Moon 4 - Caldari Navy Assembly Plant'],
  }, { fetchImpl });

  assert.equal(route.stops.at(-1).type, 'station');
  assert.equal(route.stops.at(-1).destinationId, stationId);
  assert.equal(route.stops.at(-1).systemId, 30000142);
  assert.deepEqual(route.exactDestinationIds, [stationId]);
});

test('autocomplete returns systems, stations and accessible player structures', async () => {
  const stationId = 60003760;
  const structureId = 1028858195912;
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    if (parsed.pathname === '/characters/90000001/search') {
      assert.deepEqual(parsed.searchParams.getAll('categories'), ['solar_system', 'station', 'structure']);
      return jsonResponse({ solar_system: [30000142], station: [stationId], structure: [structureId] });
    }
    if (parsed.pathname === '/universe/names') {
      const ids = JSON.parse(options.body);
      return jsonResponse(ids.map((id) => ({
        id,
        name: id === 30000142 ? 'Jita' : 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        category: id === 30000142 ? 'solar_system' : 'station',
      })));
    }
    if (parsed.pathname === `/universe/stations/${stationId}`) return jsonResponse({ system_id: 30000142 });
    if (parsed.pathname === `/universe/structures/${structureId}`) {
      assert.equal(options.headers.Authorization, 'Bearer access-token');
      return jsonResponse({ name: 'Jita Trade Hub', solar_system_id: 30000142 });
    }
    return jsonResponse({ error: 'Unexpected request' }, 500);
  };

  const results = await searchLocations('90000001', 'Jita', 'access-token', { fetchImpl });
  assert.deepEqual(results.map((item) => item.type), ['solar_system', 'station', 'structure']);
  assert.equal(results.find((item) => item.type === 'structure').systemId, 30000142);
});

function optimizationFetch(costs) {
  const systems = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
    { id: 4, name: 'Delta' },
  ];
  return async (url, options) => {
    const pathname = new URL(url).pathname;
    if (pathname === '/universe/ids') return jsonResponse({ systems });
    if (pathname === '/universe/names') {
      const ids = JSON.parse(options.body);
      return jsonResponse(ids.map((id) => ({ id, name: `System ${id}`, category: 'solar_system' })));
    }
    const routeMatch = pathname.match(/^\/route\/(\d+)\/(\d+)$/);
    if (routeMatch) {
      const origin = Number(routeMatch[1]);
      const destination = Number(routeMatch[2]);
      const cost = costs[`${origin}:${destination}`] ?? costs[`${destination}:${origin}`];
      if (!cost) return jsonResponse({ error: 'Missing test cost' }, 500);
      const middle = Array.from({ length: cost - 1 }, (_value, index) => 100000 + origin * 1000 + destination * 10 + index);
      return jsonResponse({ route: [origin, ...middle, destination] });
    }
    return jsonResponse({ error: 'Unexpected request' }, 500);
  };
}

test('route optimizer keeps the destination fixed and finds the exact minimum', async () => {
  const route = await planRoute({
    stopNames: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    optimizeOrder: true,
    fixedDestination: true,
  }, { fetchImpl: optimizationFetch({
    '1:2': 8, '1:3': 1, '1:4': 8,
    '2:3': 1, '2:4': 1, '3:4': 8,
  }) });

  assert.deepEqual(route.stops.map((stop) => stop.name), ['Alpha', 'Gamma', 'Beta', 'Delta']);
  assert.equal(route.jumps, 3);
  assert.equal(route.optimizationOriginalJumps, 17);
  assert.equal(route.optimizationSavedJumps, 14);
  assert.equal(route.fixedDestination, true);
});

test('route optimizer may move the entered destination when it is not fixed', async () => {
  const route = await planRoute({
    stopNames: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    optimizeOrder: true,
    fixedDestination: false,
  }, { fetchImpl: optimizationFetch({
    '1:2': 9, '1:3': 5, '1:4': 1,
    '2:3': 1, '2:4': 8, '3:4': 1,
  }) });

  assert.deepEqual(route.stops.map((stop) => stop.name), ['Alpha', 'Delta', 'Gamma', 'Beta']);
  assert.equal(route.jumps, 3);
  assert.equal(route.optimizationOriginalJumps, 11);
  assert.equal(route.optimizationSavedJumps, 8);
  assert.equal(route.fixedDestination, false);
});

test('optimizer preserves different station waypoints in the same solar system', async () => {
  const fetchImpl = async (url, options) => {
    const pathname = new URL(url).pathname;
    if (pathname === '/route/1/2') return jsonResponse({ route: [1, 2] });
    if (pathname === '/route/1/3') return jsonResponse({ route: [1, 9, 3] });
    if (pathname === '/route/2/3') return jsonResponse({ route: [2, 3] });
    if (pathname === '/universe/names') {
      const ids = JSON.parse(options.body);
      return jsonResponse(ids.map((id) => ({ id, name: `System ${id}`, category: 'solar_system' })));
    }
    return jsonResponse({ error: `Unexpected request ${pathname}` }, 500);
  };
  const route = await planRoute({
    stops: [
      { destinationId: 1, systemId: 1, name: 'Start', type: 'solar_system' },
      { destinationId: 60000001, systemId: 2, name: 'Station A', type: 'station' },
      { destinationId: 60000002, systemId: 2, name: 'Station B', type: 'station' },
      { destinationId: 3, systemId: 3, name: 'End', type: 'solar_system' },
    ],
    optimizeOrder: true,
    fixedDestination: true,
  }, { fetchImpl });

  assert.equal(route.stops[0].destinationId, 1);
  assert.equal(route.stops.at(-1).destinationId, 3);
  assert.deepEqual(new Set(route.stops.slice(1, -1).map((stop) => stop.destinationId)), new Set([60000001, 60000002]));
  assert.deepEqual(route.exactDestinationIds, [
    route.stops[1].destinationId,
    route.stops[2].destinationId,
    3,
  ]);
  assert.equal(route.jumps, 2);
});

test('exact optimization rejects more than fifteen route nodes', async () => {
  const stops = Array.from({ length: 16 }, (_value, index) => ({
    destinationId: 30000000 + index,
    systemId: 30000000 + index,
    name: `System ${index}`,
    type: 'solar_system',
  }));
  await assert.rejects(
    planRoute({ stops, optimizeOrder: true }),
    (error) => error.code === 'OPTIMIZATION_TOO_LARGE',
  );
});

test('IPC security accepts only the packaged main frame', () => {
  const appRoot = process.cwd();
  const mainFrame = { url: trustedRendererUrl(appRoot), parent: null };
  const webContents = { mainFrame, getURL: () => mainFrame.url };
  const mainWindow = { webContents };

  assert.equal(isTrustedRendererEvent({ sender: webContents, senderFrame: mainFrame }, mainWindow, appRoot), true);
  assert.equal(isTrustedRendererEvent({
    sender: webContents,
    senderFrame: { url: mainFrame.url, parent: mainFrame },
  }, mainWindow, appRoot), true);
  assert.equal(isTrustedRendererEvent({
    sender: webContents,
    senderFrame: { url: 'https://example.invalid/' },
  }, mainWindow, appRoot), false);
  assert.equal(isTrustedRendererEvent({
    sender: { getURL: () => mainFrame.url },
    senderFrame: mainFrame,
  }, mainWindow, appRoot), false);
});

function savedRouteFixture(name, offset = 0) {
  const startId = 30000142 + offset;
  const endId = 30002187 + offset;
  return {
    name,
    stops: [
      { id: startId, destinationId: startId, systemId: startId, name: `Start ${offset}`, type: 'solar_system' },
      { id: endId, destinationId: endId, systemId: endId, name: `End ${offset}`, type: 'solar_system' },
    ],
    preference: 'Shorter',
    securityPenalty: 50,
    expandedRoute: [{ id: startId, name: `Start ${offset}` }, { id: endId, name: `End ${offset}` }],
    exactDestinationIds: [endId],
    jumps: 1,
    optimizeOrder: false,
    fixedDestination: true,
    optimizationOriginalJumps: null,
    optimizationSavedJumps: 0,
  };
}

test('route folders support renaming, moving and drag-order persistence', async () => {
  const testRoot = path.join(__dirname, '..', 'work', 'test-temp');
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'moway-folders-'));
  const safeStorage = { isEncryptionAvailable: () => true };
  try {
    const store = new LocalStore(path.join(directory, 'navigator-data.json'), safeStorage);
    await store.load();
    let state = await store.createRouteFolder('Logistics');
    const folderId = state.routeFolders[0].id;
    const first = await store.saveRoute({ ...savedRouteFixture('First', 0), folderId });
    const second = await store.saveRoute({ ...savedRouteFixture('Second', 10), folderId });
    await store.moveRoute(second.id, folderId, first.id);
    await store.renameRoute(first.id, 'First Renamed');
    state = await store.renameRouteFolder(folderId, 'Operations');

    assert.equal(state.routeFolders[0].name, 'Operations');
    const ordered = state.savedRoutes.filter((route) => route.folderId === folderId);
    assert.deepEqual(ordered.map((route) => route.id), [second.id, first.id]);
    assert.equal(ordered[1].name, 'First Renamed');

    state = await store.deleteRouteFolder(folderId);
    assert.equal(state.routeFolders.length, 0);
    assert.ok(state.savedRoutes.every((route) => route.folderId === null));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('character folders preserve notes, drag order, and encrypted authorization data', async () => {
  const testRoot = path.join(__dirname, '..', 'work', 'test-temp');
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'moway-character-folders-'));
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: (value) => Buffer.from(value, 'utf8'),
    decryptString: (value) => value.toString('utf8'),
  };
  try {
    const filePath = path.join(directory, 'navigator-data.json');
    const store = new LocalStore(filePath, safeStorage);
    await store.load();
    await store.upsertCharacter({ characterId: '90000001', name: 'First Pilot', refreshToken: 'token-one', scopes: ['scope'], authorizedAt: new Date().toISOString() });
    await store.upsertCharacter({ characterId: '90000002', name: 'Second Pilot', refreshToken: 'token-two', scopes: ['scope'], authorizedAt: new Date().toISOString() });
    let state = await store.createCharacterFolder('Fleet');
    const folderId = state.characterFolders[0].id;
    await store.moveCharacter('90000002', folderId);
    await store.moveCharacter('90000001', folderId, '90000002');
    await store.setCharacterNote('90000001', 'Main combat character');
    state = await store.renameCharacterFolder(folderId, 'Fleet Characters');

    assert.equal(state.characterFolders[0].name, 'Fleet Characters');
    assert.deepEqual(state.characters.map((character) => character.characterId), ['90000001', '90000002']);
    assert.equal(state.characters[0].note, 'Main combat character');
    assert.equal(Object.hasOwn(state.characters[0], 'encryptedRefreshToken'), false);
    assert.equal(store.getRefreshToken('90000001'), 'token-one');

    const persisted = JSON.parse(await fs.readFile(filePath, 'utf8'));
    assert.equal(persisted.characters[0].note, 'Main combat character');
    assert.ok(persisted.characters[0].encryptedRefreshToken);

    state = await store.deleteCharacterFolder(folderId);
    assert.equal(state.characterFolders.length, 0);
    assert.ok(state.characters.every((character) => character.folderId === null));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('route library export excludes account data and imports idempotently', async () => {
  const testRoot = path.join(__dirname, '..', 'work', 'test-temp');
  await fs.mkdir(testRoot, { recursive: true });
  const sourceDirectory = await fs.mkdtemp(path.join(testRoot, 'moway-export-'));
  const targetDirectory = await fs.mkdtemp(path.join(testRoot, 'moway-import-'));
  const safeStorage = { isEncryptionAvailable: () => true };
  try {
    const source = new LocalStore(path.join(sourceDirectory, 'navigator-data.json'), safeStorage);
    await source.load();
    let state = await source.createRouteFolder('Shared Routes');
    const folderId = state.routeFolders[0].id;
    await source.saveRoute({ ...savedRouteFixture('Shared Route'), folderId });
    const library = source.exportRouteLibrary();
    const serialized = JSON.stringify(library);

    assert.equal(library.format, 'moway-route-library');
    assert.equal(library.version, 1);
    assert.equal(Object.hasOwn(library, 'characters'), false);
    assert.equal(Object.hasOwn(library, 'settings'), false);
    assert.equal(serialized.includes('encryptedRefreshToken'), false);
    assert.equal(serialized.includes('clientId'), false);

    const target = new LocalStore(path.join(targetDirectory, 'navigator-data.json'), safeStorage);
    await target.load();
    let result = await target.importRouteLibrary(library);
    assert.equal(result.importedRoutes, 1);
    assert.equal(result.importedFolders, 1);
    assert.equal(result.state.savedRoutes[0].name, 'Shared Route');
    assert.equal(result.state.routeFolders[0].name, 'Shared Routes');

    result = await target.importRouteLibrary(library);
    assert.equal(result.state.savedRoutes.length, 1);
    assert.equal(result.state.routeFolders.length, 1);
  } finally {
    await fs.rm(sourceDirectory, { recursive: true, force: true });
    await fs.rm(targetDirectory, { recursive: true, force: true });
  }
});

test('route library import rejects unrelated or malformed files', async () => {
  const testRoot = path.join(__dirname, '..', 'work', 'test-temp');
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'moway-invalid-import-'));
  try {
    const store = new LocalStore(path.join(directory, 'navigator-data.json'), { isEncryptionAvailable: () => true });
    await store.load();
    await assert.rejects(
      store.importRouteLibrary({ format: 'something-else', version: 1, folders: [], routes: [] }),
      (error) => error.code === 'ROUTE_IMPORT_INVALID',
    );
    await assert.rejects(
      store.importRouteLibrary({ format: 'moway-route-library', version: 99, folders: [], routes: [] }),
      (error) => error.code === 'ROUTE_IMPORT_VERSION',
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
