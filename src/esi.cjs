'use strict';

const {
  APP_NAME,
  APP_VERSION,
  COMPATIBILITY_DATE,
  ESI_BASE_URL,
} = require('./constants.cjs');
const { AppError } = require('./errors.cjs');

function makeUserAgent(contact = '') {
  const suffix = String(contact || '').trim();
  return `${APP_NAME.replaceAll(' ', '')}/${APP_VERSION}${suffix ? ` (${suffix})` : ' (Windows desktop)'}`;
}

async function esiRequest(path, {
  method = 'GET',
  body = undefined,
  accessToken = null,
  contact = '',
  fetchImpl = fetch,
} = {}) {
  const headers = {
    Accept: 'application/json',
    'Accept-Language': 'en',
    'User-Agent': makeUserAgent(contact),
    'X-Compatibility-Date': COMPATIBILITY_DATE,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetchImpl(`${ESI_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error',
    });
  } catch {
    throw new AppError('无法连接到 EVE ESI，请检查网络后重试。', 'ESI_NETWORK_FAILED');
  }

  let payload = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `HTTP ${response.status}`;
    const authCode = response.status === 401 || response.status === 403 ? 'ESI_AUTH_FAILED' : 'ESI_REQUEST_FAILED';
    throw new AppError(`ESI 请求失败：${message}`, authCode, {
      status: response.status,
      retryAfter: response.headers?.get?.('retry-after') || null,
    });
  }
  return payload;
}

async function resolveSolarSystems(names, options = {}) {
  const cleaned = [...new Set(names.map((name) => String(name || '').trim()).filter(Boolean))];
  if (!cleaned.length) throw new AppError('请至少输入一个星系名称。', 'SYSTEM_NAME_REQUIRED');
  const result = await esiRequest('/universe/ids', {
    ...options,
    method: 'POST',
    body: cleaned,
  });
  const systems = result?.systems || [];
  const byName = new Map(systems.map((system) => [system.name.toLocaleLowerCase('en-US'), system]));
  const unresolved = cleaned.filter((name) => !byName.has(name.toLocaleLowerCase('en-US')));
  if (unresolved.length) {
    throw new AppError(
      `找不到星系：${unresolved.join('、')}。ESI 只接受完整的英文星系名称。`,
      'SYSTEM_NOT_FOUND',
      { unresolved },
    );
  }
  return names.map((name) => {
    const system = byName.get(String(name).trim().toLocaleLowerCase('en-US'));
    return { id: Number(system.id), name: system.name };
  });
}

async function stationDetails(stationId, options = {}) {
  return esiRequest(`/universe/stations/${Number(stationId)}`, options);
}

async function structureDetails(structureId, accessToken, options = {}) {
  return esiRequest(`/universe/structures/${Number(structureId)}`, {
    ...options,
    accessToken,
  });
}

function normalizeResolvedLocation(location) {
  const destinationId = Number(location.destinationId ?? location.id);
  const systemId = Number(location.systemId ?? destinationId);
  const type = location.type || 'solar_system';
  if (!Number.isSafeInteger(destinationId) || !Number.isSafeInteger(systemId) || !location.name) {
    throw new AppError('路线节点信息无效，请重新选择。', 'LOCATION_INVALID');
  }
  if (!['solar_system', 'station', 'structure'].includes(type)) {
    throw new AppError('路线节点类型无效，请重新选择。', 'LOCATION_TYPE_INVALID');
  }
  return {
    id: destinationId,
    destinationId,
    systemId,
    name: String(location.name),
    type,
  };
}

async function resolveLocations(inputs, options = {}) {
  const normalizedInputs = inputs
    .map((input) => (typeof input === 'string' ? { name: input } : input || {}))
    .filter((input) => String(input.name || input.text || '').trim());
  if (!normalizedInputs.length) throw new AppError('请至少输入一个路线节点。', 'LOCATION_REQUIRED');

  const exactNames = normalizedInputs
    .filter((input) => !(input.destinationId || input.id))
    .map((input) => String(input.name || input.text).trim());
  let byName = new Map();
  if (exactNames.length) {
    const result = await esiRequest('/universe/ids', {
      ...options,
      method: 'POST',
      body: [...new Set(exactNames)],
    });
    const systems = (result?.systems || []).map((item) => ({ ...item, type: 'solar_system' }));
    const stations = (result?.stations || []).map((item) => ({ ...item, type: 'station' }));
    byName = new Map([...systems, ...stations].map((item) => [
      item.name.toLocaleLowerCase('en-US'),
      item,
    ]));
  }

  const locations = [];
  for (const input of normalizedInputs) {
    if (input.destinationId || input.id) {
      locations.push(normalizeResolvedLocation(input));
      continue;
    }
    const name = String(input.name || input.text).trim();
    const match = byName.get(name.toLocaleLowerCase('en-US'));
    if (!match) {
      throw new AppError(
        `找不到“${name}”。请选择联想结果，或输入完整的英文星系 / NPC 空间站名称。`,
        'LOCATION_NOT_FOUND',
        { unresolved: [name] },
      );
    }
    if (match.type === 'solar_system') {
      locations.push(normalizeResolvedLocation({
        destinationId: match.id,
        systemId: match.id,
        name: match.name,
        type: match.type,
      }));
      continue;
    }
    const details = await stationDetails(match.id, options);
    locations.push(normalizeResolvedLocation({
      destinationId: match.id,
      systemId: details.system_id,
      name: match.name,
      type: match.type,
    }));
  }
  return locations;
}

async function namesForIds(ids, options = {}) {
  const uniqueIds = [...new Set(ids.map(Number))];
  const chunks = [];
  for (let index = 0; index < uniqueIds.length; index += 1000) {
    chunks.push(uniqueIds.slice(index, index + 1000));
  }
  const responses = await Promise.all(
    chunks.map((chunk) => esiRequest('/universe/names', {
      ...options,
      method: 'POST',
      body: chunk,
    })),
  );
  return new Map(
    responses.flat().map((item) => [Number(item.id), { id: Number(item.id), name: item.name, category: item.category }]),
  );
}

async function calculateRouteLeg(originId, destinationId, preference, securityPenalty, options = {}) {
  if (originId === destinationId) return [originId];
  const result = await esiRequest(`/route/${originId}/${destinationId}`, {
    ...options,
    method: 'POST',
    body: {
      preference,
      security_penalty: Number(securityPenalty),
      avoid_systems: [],
      connections: [],
    },
  });
  if (!Array.isArray(result?.route) || !result.route.length) {
    throw new AppError('ESI 没有返回有效路线。', 'ROUTE_EMPTY');
  }
  return result.route.map(Number);
}

async function runInBatches(items, batchSize, worker) {
  const results = [];
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    results.push(...await Promise.all(batch.map(worker)));
  }
  return results;
}

async function optimizeStopSequence(stops, preference, securityPenalty, fixedDestination, options = {}) {
  if (stops.length > 15) {
    throw new AppError('精确顺序优化最多支持 15 个路线节点，请减少途经点或关闭自动优化。', 'OPTIMIZATION_TOO_LARGE');
  }

  const uniqueSystems = [...new Set(stops.map((stop) => Number(stop.systemId)))];
  const pairs = [];
  for (let left = 0; left < uniqueSystems.length; left += 1) {
    for (let right = left + 1; right < uniqueSystems.length; right += 1) {
      pairs.push([uniqueSystems[left], uniqueSystems[right]]);
    }
  }

  const legCache = new Map(uniqueSystems.map((systemId) => [`${systemId}:${systemId}`, [systemId]]));
  const calculated = await runInBatches(pairs, 6, async ([originId, destinationId]) => ({
    originId,
    destinationId,
    leg: await calculateRouteLeg(originId, destinationId, preference, securityPenalty, options),
  }));
  calculated.forEach(({ originId, destinationId, leg }) => {
    legCache.set(`${originId}:${destinationId}`, leg);
    legCache.set(`${destinationId}:${originId}`, [...leg].reverse());
  });

  const legFor = (leftIndex, rightIndex) => {
    const originId = stops[leftIndex].systemId;
    const destinationId = stops[rightIndex].systemId;
    const leg = legCache.get(`${originId}:${destinationId}`);
    if (!leg) throw new AppError('优化路线时缺少航段数据。', 'OPTIMIZATION_LEG_MISSING');
    return leg;
  };
  const jumpCost = (leftIndex, rightIndex) => Math.max(0, legFor(leftIndex, rightIndex).length - 1);

  const originalOrder = stops.map((_stop, index) => index);
  const originalJumps = originalOrder.slice(1).reduce(
    (total, index, position) => total + jumpCost(originalOrder[position], index),
    0,
  );
  const fixedEndIndex = fixedDestination ? stops.length - 1 : null;
  const candidates = originalOrder.slice(1, fixedDestination ? -1 : undefined);

  if (!candidates.length) {
    const orderedIndices = fixedEndIndex === null ? [0] : [0, fixedEndIndex];
    return {
      stops: orderedIndices.map((index) => stops[index]),
      legs: orderedIndices.slice(1).map((index, position) => legFor(orderedIndices[position], index)),
      originalJumps,
      optimizedJumps: originalJumps,
    };
  }

  const stateCount = 1 << candidates.length;
  const costs = Array.from({ length: stateCount }, () => Array(candidates.length).fill(Number.POSITIVE_INFINITY));
  const tiePenalties = Array.from({ length: stateCount }, () => Array(candidates.length).fill(Number.POSITIVE_INFINITY));
  const previous = Array.from({ length: stateCount }, () => Array(candidates.length).fill(-1));
  for (let candidate = 0; candidate < candidates.length; candidate += 1) {
    costs[1 << candidate][candidate] = jumpCost(0, candidates[candidate]);
    tiePenalties[1 << candidate][candidate] = Math.abs(candidates[candidate]);
  }

  for (let mask = 1; mask < stateCount; mask += 1) {
    for (let last = 0; last < candidates.length; last += 1) {
      if (!(mask & (1 << last)) || !Number.isFinite(costs[mask][last])) continue;
      for (let next = 0; next < candidates.length; next += 1) {
        if (mask & (1 << next)) continue;
        const nextMask = mask | (1 << next);
        const nextCost = costs[mask][last] + jumpCost(candidates[last], candidates[next]);
        const nextPenalty = tiePenalties[mask][last] + Math.abs(candidates[last] - candidates[next]);
        if (nextCost < costs[nextMask][next]
          || (nextCost === costs[nextMask][next] && nextPenalty < tiePenalties[nextMask][next])) {
          costs[nextMask][next] = nextCost;
          tiePenalties[nextMask][next] = nextPenalty;
          previous[nextMask][next] = last;
        }
      }
    }
  }

  const fullMask = stateCount - 1;
  let bestLast = -1;
  let bestCost = Number.POSITIVE_INFINITY;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let last = 0; last < candidates.length; last += 1) {
    const terminalCost = fixedEndIndex === null ? 0 : jumpCost(candidates[last], fixedEndIndex);
    const total = costs[fullMask][last] + terminalCost;
    const terminalPenalty = fixedEndIndex === null ? 0 : Math.abs(candidates[last] - fixedEndIndex);
    const totalPenalty = tiePenalties[fullMask][last] + terminalPenalty;
    if (total < bestCost || (total === bestCost && totalPenalty < bestPenalty)) {
      bestCost = total;
      bestPenalty = totalPenalty;
      bestLast = last;
    }
  }

  const reversedCandidates = [];
  let mask = fullMask;
  let cursor = bestLast;
  while (cursor >= 0) {
    reversedCandidates.push(candidates[cursor]);
    const prior = previous[mask][cursor];
    mask ^= 1 << cursor;
    cursor = prior;
  }
  reversedCandidates.reverse();
  const orderedIndices = [0, ...reversedCandidates];
  if (fixedEndIndex !== null) orderedIndices.push(fixedEndIndex);
  const legs = orderedIndices.slice(1).map((index, position) => legFor(orderedIndices[position], index));

  return {
    stops: orderedIndices.map((index) => stops[index]),
    legs,
    originalJumps,
    optimizedJumps: bestCost,
  };
}

async function planRoute({
  stops: stopInputs,
  stopNames,
  preference = 'Shorter',
  securityPenalty = 50,
  optimizeOrder = false,
  fixedDestination = true,
}, options = {}) {
  const inputs = Array.isArray(stopInputs) ? stopInputs : (stopNames || []);
  if (inputs.length < 2) {
    throw new AppError('路线至少需要一个起点和一个终点。', 'ROUTE_STOPS_REQUIRED');
  }
  if (!['Shorter', 'Safer', 'LessSecure'].includes(preference)) {
    throw new AppError('路线偏好无效。', 'ROUTE_PREFERENCE_INVALID');
  }
  const penalty = Number(securityPenalty);
  if (!Number.isInteger(penalty) || penalty < 0 || penalty > 100) {
    throw new AppError('安全权重必须在 0–100 之间。', 'ROUTE_PENALTY_INVALID');
  }

  const resolvedStops = await resolveLocations(inputs, options);
  let stops = resolvedStops;
  let legs;
  let optimizationOriginalJumps = null;
  let optimizationSavedJumps = 0;
  if (optimizeOrder) {
    const optimized = await optimizeStopSequence(
      resolvedStops,
      preference,
      penalty,
      Boolean(fixedDestination),
      options,
    );
    stops = optimized.stops;
    legs = optimized.legs;
    optimizationOriginalJumps = optimized.originalJumps;
    optimizationSavedJumps = Math.max(0, optimized.originalJumps - optimized.optimizedJumps);
  } else {
    const legPromises = [];
    for (let index = 0; index < stops.length - 1; index += 1) {
      legPromises.push(calculateRouteLeg(
        stops[index].systemId,
        stops[index + 1].systemId,
        preference,
        penalty,
        options,
      ));
    }
    legs = await Promise.all(legPromises);
  }
  const routeIds = legs.flatMap((leg, index) => (index === 0 ? leg : leg.slice(1)));
  const nameMap = await namesForIds(routeIds, options);
  const expandedRoute = routeIds.map((id) => ({
    id,
    name: nameMap.get(id)?.name || `星系 ${id}`,
  }));
  const exactDestinationIds = legs.flatMap((leg, index) => {
    const ids = leg.slice(1);
    const destination = stops[index + 1];
    if (destination.destinationId !== destination.systemId) {
      if (ids.at(-1) === destination.systemId) ids[ids.length - 1] = destination.destinationId;
      else ids.push(destination.destinationId);
    }
    return ids;
  });

  return {
    id: null,
    name: `${stops[0].name} → ${stops.at(-1).name}`,
    stops,
    preference,
    securityPenalty: penalty,
    optimizeOrder: Boolean(optimizeOrder),
    fixedDestination: Boolean(fixedDestination),
    optimizationOriginalJumps,
    optimizationSavedJumps,
    expandedRoute,
    exactDestinationIds,
    jumps: Math.max(0, expandedRoute.length - 1),
    plannedAt: new Date().toISOString(),
  };
}

async function searchLocations(characterId, query, accessToken, options = {}) {
  const search = String(query || '').trim();
  if (search.length < 3) return [];
  const params = new URLSearchParams({ search, strict: 'false' });
  ['solar_system', 'station', 'structure'].forEach((category) => params.append('categories', category));
  const result = await esiRequest(`/characters/${encodeURIComponent(characterId)}/search?${params.toString()}`, {
    ...options,
    accessToken,
  });
  const systemIds = (result?.solar_system || []).slice(0, 8).map(Number);
  const stationIds = (result?.station || []).slice(0, 8).map(Number);
  const structureIds = (result?.structure || []).slice(0, 8).map(Number);
  const publicNames = await namesForIds([...systemIds, ...stationIds], options);
  const stationInfo = await Promise.all(stationIds.map(async (id) => ({ id, info: await stationDetails(id, options) })));
  const structureInfo = await Promise.all(structureIds.map(async (id) => {
    try {
      return { id, info: await structureDetails(id, accessToken, options) };
    } catch {
      return null;
    }
  }));

  const suggestions = [
    ...systemIds.map((id) => normalizeResolvedLocation({
      destinationId: id,
      systemId: id,
      name: publicNames.get(id)?.name || `星系 ${id}`,
      type: 'solar_system',
    })),
    ...stationInfo.map(({ id, info }) => normalizeResolvedLocation({
      destinationId: id,
      systemId: info.system_id,
      name: publicNames.get(id)?.name || info.name,
      type: 'station',
    })),
    ...structureInfo.filter(Boolean).map(({ id, info }) => normalizeResolvedLocation({
      destinationId: id,
      systemId: info.solar_system_id,
      name: info.name,
      type: 'structure',
    })),
  ];
  const lower = search.toLocaleLowerCase('en-US');
  return suggestions
    .sort((left, right) => {
      const leftStarts = left.name.toLocaleLowerCase('en-US').startsWith(lower) ? 0 : 1;
      const rightStarts = right.name.toLocaleLowerCase('en-US').startsWith(lower) ? 0 : 1;
      return leftStarts - rightStarts || left.name.localeCompare(right.name, 'en-US');
    })
    .slice(0, 18);
}

async function getCharacterOnline(characterId, accessToken, options = {}) {
  const result = await esiRequest(`/characters/${encodeURIComponent(characterId)}/online`, {
    ...options,
    accessToken,
  });
  return Boolean(result?.online);
}

async function setAutopilotWaypoints(destinationIds, accessToken, options = {}) {
  if (!destinationIds.length) throw new AppError('路线中没有可写入的导航点。', 'WAYPOINTS_EMPTY');
  let completed = 0;
  for (const destinationId of destinationIds) {
    const query = new URLSearchParams({
      add_to_beginning: 'false',
      clear_other_waypoints: completed === 0 ? 'true' : 'false',
      destination_id: String(destinationId),
    });
    await esiRequest(`/ui/autopilot/waypoint?${query.toString()}`, {
      ...options,
      method: 'POST',
      accessToken,
    });
    completed += 1;
  }
  return completed;
}

module.exports = {
  calculateRouteLeg,
  esiRequest,
  getCharacterOnline,
  makeUserAgent,
  namesForIds,
  planRoute,
  resolveLocations,
  resolveSolarSystems,
  searchLocations,
  setAutopilotWaypoints,
  stationDetails,
  structureDetails,
};
