'use strict';

const { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } = require('electron');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const {
  CALLBACK_HOST,
  CALLBACK_PATH,
  CALLBACK_PORT,
  CALLBACK_URL,
  REQUIRED_SCOPES,
} = require('./src/constants.cjs');
const { AppError, publicError } = require('./src/errors.cjs');
const { isTrustedRendererEvent } = require('./src/ipc-security.cjs');
const { LocalStore, MAX_IMPORT_BYTES } = require('./src/store.cjs');
const {
  buildAuthorizationUrl,
  createPkce,
  exchangeAuthorizationCode,
  getSsoConfiguration,
  refreshAccessToken,
  validateAccessToken,
} = require('./src/sso.cjs');
const {
  getCharacterOnline,
  planRoute,
  searchLocations,
  setAutopilotWaypoints,
} = require('./src/esi.cjs');

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();

let mainWindow = null;
let store = null;
let pendingAuthorization = false;
const accessTokenCache = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1060,
    minHeight: 700,
    backgroundColor: '#071015',
    title: 'MOWAY',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://developers.eveonline.com/')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.session.setPermissionCheckHandler(() => false);
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault();
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

function successHtml(language = 'zh-CN') {
  const copy = language === 'en'
    ? ['Authorization complete', 'Authorization received', 'You can close this page and return to MOWAY. The app never read your EVE password.']
    : ['授权成功', '授权已送达', '你现在可以关闭此页面并返回 MOWAY。程序从未读取你的 EVE 密码。'];
  return `<!doctype html><html lang="${language}"><meta charset="utf-8"><title>${copy[0]}</title><style>body{font-family:system-ui;background:#071015;color:#e7f7f7;display:grid;place-items:center;min-height:100vh;margin:0}.box{max-width:520px;padding:36px;border:1px solid #1e5054;border-radius:16px;background:#0c1b21}h1{color:#66e4dd}p{line-height:1.7}</style><div class="box"><h1>${copy[1]}</h1><p>${copy[2]}</p></div></html>`;
}

function failureHtml(language = 'zh-CN') {
  const copy = language === 'en'
    ? ['Authorization failed', 'Authorization was not completed', 'Close this page and return to MOWAY for details.']
    : ['授权失败', '授权未完成', '请关闭此页面并回到 MOWAY 查看原因。'];
  return `<!doctype html><html lang="${language}"><meta charset="utf-8"><title>${copy[0]}</title><style>body{font-family:system-ui;background:#160b0c;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.box{max-width:520px;padding:36px;border:1px solid #74343a;border-radius:16px;background:#211014}h1{color:#ff8d97}p{line-height:1.7}</style><div class="box"><h1>${copy[1]}</h1><p>${copy[2]}</p></div></html>`;
}

async function waitForOAuthCallback(expectedState) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      server.close();
      if (error) reject(error);
      else resolve(value);
    };

    const server = http.createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url, CALLBACK_URL);
        if (request.method !== 'GET' || requestUrl.pathname !== CALLBACK_PATH) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Not found');
          return;
        }
        const state = requestUrl.searchParams.get('state') || '';
        const stateMatches = state.length === expectedState.length
          && crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));
        const code = requestUrl.searchParams.get('code');
        const oauthError = requestUrl.searchParams.get('error_description')
          || requestUrl.searchParams.get('error');
        if (!stateMatches || !code || oauthError) {
          response.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          response.end(failureHtml(store.getSettings().language));
          finish(new AppError(
            oauthError ? `EVE 授权未完成：${oauthError}` : '授权回调校验失败，请重新绑定。',
            'OAUTH_CALLBACK_INVALID',
          ));
          return;
        }
        response.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
        });
        response.end(successHtml(store.getSettings().language));
        finish(null, code);
      } catch {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Invalid request');
      }
    });

    server.on('error', (error) => {
      finish(new AppError(
        error.code === 'EADDRINUSE'
          ? `本机回调端口 ${CALLBACK_PORT} 已被占用，请关闭占用程序后重试。`
          : '无法启动本机授权回调。',
        'CALLBACK_SERVER_FAILED',
      ));
    });
    server.listen(CALLBACK_PORT, CALLBACK_HOST);
    const timer = setTimeout(() => {
      finish(new AppError('EVE 授权等待超时，请重试。', 'OAUTH_TIMEOUT'));
    }, 5 * 60 * 1000);
  });
}

async function authorizeCharacter() {
  if (pendingAuthorization) throw new AppError('已有一个角色正在授权，请先完成当前授权。', 'OAUTH_IN_PROGRESS');
  const { clientId } = store.getSettings();
  if (!clientId) throw new AppError('请先在设置中填写 EVE 应用的 Client ID。', 'CLIENT_ID_REQUIRED');
  if (!safeStorage.isEncryptionAvailable()) {
    throw new AppError('Windows 安全存储不可用，无法安全保存角色授权。', 'SECURE_STORAGE_UNAVAILABLE');
  }

  pendingAuthorization = true;
  try {
    const { metadata, jwks } = await getSsoConfiguration();
    void jwks;
    const pkce = createPkce();
    const callbackPromise = waitForOAuthCallback(pkce.state);
    const authorizationUrl = buildAuthorizationUrl({
      authorizationEndpoint: metadata.authorization_endpoint,
      clientId,
      challenge: pkce.challenge,
      state: pkce.state,
    });
    await shell.openExternal(authorizationUrl);
    const code = await callbackPromise;
    const tokens = await exchangeAuthorizationCode({
      tokenEndpoint: metadata.token_endpoint,
      clientId,
      code,
      verifier: pkce.verifier,
    });
    const identity = await validateAccessToken(tokens.access_token, clientId);
    if (!tokens.refresh_token) {
      throw new AppError('EVE 没有返回长期授权令牌，请重新绑定。', 'REFRESH_TOKEN_MISSING');
    }
    await store.upsertCharacter({
      ...identity,
      refreshToken: tokens.refresh_token,
      authorizedAt: new Date().toISOString(),
    });
    accessTokenCache.set(identity.characterId, {
      accessToken: tokens.access_token,
      expiresAt: identity.expiresAt,
    });
    return store.publicState();
  } finally {
    pendingAuthorization = false;
  }
}

async function accessTokenFor(characterId) {
  const cached = accessTokenCache.get(String(characterId));
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.accessToken;
  const settings = store.getSettings();
  if (!settings.clientId) throw new AppError('Client ID 未配置。', 'CLIENT_ID_REQUIRED');
  const refreshToken = store.getRefreshToken(characterId);
  const { metadata } = await getSsoConfiguration();
  let tokens;
  try {
    tokens = await refreshAccessToken({
      tokenEndpoint: metadata.token_endpoint,
      clientId: settings.clientId,
      refreshToken,
    });
  } catch (error) {
    await store.updateCharacterStatus(characterId, { authState: 'reauthorize' });
    throw error;
  }
  const identity = await validateAccessToken(tokens.access_token, settings.clientId);
  if (String(identity.characterId) !== String(characterId)) {
    throw new AppError('刷新后的授权角色与本地记录不一致。', 'CHARACTER_MISMATCH');
  }
  if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
    await store.rotateRefreshToken(characterId, tokens.refresh_token);
  }
  accessTokenCache.set(String(characterId), {
    accessToken: tokens.access_token,
    expiresAt: identity.expiresAt,
  });
  return tokens.access_token;
}

async function refreshCharacterStatuses() {
  const state = store.publicState();
  const { contact } = store.getSettings();
  for (const character of state.characters) {
    try {
      const accessToken = await accessTokenFor(character.characterId);
      const online = await getCharacterOnline(character.characterId, accessToken, { contact });
      await store.updateCharacterStatus(character.characterId, {
        lastOnline: online,
        lastCheckedAt: new Date().toISOString(),
        authState: 'valid',
      });
    } catch (error) {
      await store.updateCharacterStatus(character.characterId, {
        lastOnline: null,
        lastCheckedAt: new Date().toISOString(),
        authState: error.code === 'SSO_TOKEN_FAILED' || error.code === 'ESI_AUTH_FAILED'
          ? 'reauthorize'
          : 'error',
      });
    }
  }
  return store.publicState();
}

async function applyRouteToOnlineCharacters(route, mode) {
  if (!route?.stops?.length || !route?.expandedRoute?.length) {
    throw new AppError('请先规划或载入一条有效路线。', 'ROUTE_REQUIRED');
  }
  const destinations = mode === 'exact'
    ? (route.exactDestinationIds || route.expandedRoute.slice(1).map((system) => Number(system.id)))
    : route.stops.slice(1).map((location) => Number(location.destinationId ?? location.id));
  if (mode === 'exact' && destinations.length > 250) {
    throw new AppError('逐跳锁定最多支持 250 跳；请减少路线长度或改用规划停靠点模式。', 'ROUTE_TOO_LONG');
  }

  const state = store.publicState();
  if (!state.characters.length) throw new AppError('请先绑定至少一个角色。', 'NO_CHARACTERS');
  const selectedCharacters = state.characters.filter((character) => character.navigationEnabled !== false);
  if (!selectedCharacters.length) throw new AppError('请至少勾选一个导航角色。', 'NO_SELECTED_CHARACTERS');
  const { contact } = store.getSettings();
  const results = [];
  for (const character of selectedCharacters) {
    try {
      const accessToken = await accessTokenFor(character.characterId);
      const online = await getCharacterOnline(character.characterId, accessToken, { contact });
      await store.updateCharacterStatus(character.characterId, {
        lastOnline: online,
        lastCheckedAt: new Date().toISOString(),
        authState: 'valid',
      });
      if (!online) {
        results.push({ characterId: character.characterId, name: character.name, status: 'offline', setCount: 0 });
        continue;
      }
      const setCount = await setAutopilotWaypoints(destinations, accessToken, { contact });
      results.push({ characterId: character.characterId, name: character.name, status: 'success', setCount });
    } catch (error) {
      const failure = publicError(error);
      results.push({
        characterId: character.characterId,
        name: character.name,
        status: 'failed',
        setCount: 0,
        message: failure.message,
        code: failure.code,
      });
    }
  }
  return { results, state: store.publicState() };
}

async function searchRouteLocations(query) {
  const state = store.publicState();
  const character = state.characters.find((item) => item.navigationEnabled !== false) || state.characters[0];
  if (!character) return [];
  const accessToken = await accessTokenFor(character.characterId);
  return searchLocations(character.characterId, query, accessToken, {
    contact: store.getSettings().contact,
  });
}

async function exportRouteLibrary() {
  const date = new Date().toISOString().slice(0, 10);
  const result = await dialog.showSaveDialog(mainWindow, {
    title: store.getSettings().language === 'en' ? 'Export Route Library' : '导出路线库',
    defaultPath: `MOWAY-route-library-${date}.moway-routes.json`,
    filters: [{ name: 'MOWAY Route Library', extensions: ['json'] }],
    properties: ['createDirectory', 'showOverwriteConfirmation'],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify(store.exportRouteLibrary(), null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  return { canceled: false, fileName: path.basename(result.filePath) };
}

async function importRouteLibrary() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: store.getSettings().language === 'en' ? 'Import Route Library' : '导入路线库',
    filters: [{ name: 'MOWAY Route Library', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const filePath = result.filePaths[0];
  const stat = await fs.stat(filePath);
  if (!stat.isFile() || stat.size > MAX_IMPORT_BYTES) {
    throw new AppError('路线库文件无效或超过 10 MB。', 'ROUTE_IMPORT_TOO_LARGE');
  }
  let library;
  try {
    library = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    throw new AppError('无法读取路线库文件，文件可能已损坏。', 'ROUTE_IMPORT_INVALID');
  }
  return {
    canceled: false,
    fileName: path.basename(filePath),
    ...(await store.importRouteLibrary(library)),
  };
}

function handle(channel, handler) {
  ipcMain.handle(channel, async (event, payload) => {
    try {
      if (!isTrustedRendererEvent(event, mainWindow, __dirname)) {
        throw new AppError('已拒绝来自非 MOWAY 主界面的请求。', 'UNTRUSTED_RENDERER');
      }
      return { ok: true, data: await handler(payload) };
    } catch (error) {
      return { ok: false, error: publicError(error) };
    }
  });
}

function registerIpc() {
  handle('state:get', () => store.publicState());
  handle('settings:save', (payload) => store.saveSettings(payload || {}));
  handle('settings:set-theme', (payload) => store.saveTheme(payload?.theme));
  handle('settings:set-language', (payload) => store.saveLanguage(payload?.language));
  handle('auth:begin', () => authorizeCharacter());
  handle('character:remove', (payload) => {
    accessTokenCache.delete(String(payload?.characterId));
    return store.removeCharacter(payload?.characterId);
  });
  handle('character:set-navigation', (payload) => store.setCharacterNavigationEnabled(
    payload?.characterId,
    payload?.enabled,
  ));
  handle('character:set-note', (payload) => store.setCharacterNote(payload?.characterId, payload?.note));
  handle('character:move', (payload) => store.moveCharacter(
    payload?.characterId,
    payload?.folderId,
    payload?.beforeCharacterId,
  ));
  handle('character-folder:create', (payload) => store.createCharacterFolder(payload?.name));
  handle('character-folder:rename', (payload) => store.renameCharacterFolder(payload?.folderId, payload?.name));
  handle('character-folder:delete', (payload) => store.deleteCharacterFolder(payload?.folderId));
  handle('characters:set-all-navigation', (payload) => store.setAllCharactersNavigationEnabled(payload?.enabled));
  handle('characters:refresh', () => refreshCharacterStatuses());
  handle('location:search', (payload) => searchRouteLocations(payload?.query));
  handle('route:plan', (payload) => planRoute(payload, { contact: store.getSettings().contact }));
  handle('route:save', (payload) => store.saveRoute(payload));
  handle('route:rename', (payload) => store.renameRoute(payload?.routeId, payload?.name));
  handle('route:move', (payload) => store.moveRoute(
    payload?.routeId,
    payload?.folderId,
    payload?.beforeRouteId,
  ));
  handle('route:delete', (payload) => store.deleteRoute(payload?.routeId));
  handle('route-folder:create', (payload) => store.createRouteFolder(payload?.name));
  handle('route-folder:rename', (payload) => store.renameRouteFolder(payload?.folderId, payload?.name));
  handle('route-folder:delete', (payload) => store.deleteRouteFolder(payload?.folderId));
  handle('route-library:export', () => exportRouteLibrary());
  handle('route-library:import', () => importRouteLibrary());
  handle('route:apply', (payload) => applyRouteToOnlineCharacters(payload?.route, payload?.mode));
  handle('external:open-developers', () => shell.openExternal('https://developers.eveonline.com/applications'));
}

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

app.whenReady().then(async () => {
  store = new LocalStore(path.join(app.getPath('userData'), 'navigator-data.json'), safeStorage);
  await store.load();
  registerIpc();
  createWindow();
});

app.on('window-all-closed', () => {
  accessTokenCache.clear();
  if (process.platform !== 'darwin') app.quit();
});
