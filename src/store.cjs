'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { CALLBACK_URL } = require('./constants.cjs');
const { AppError } = require('./errors.cjs');

const ROUTE_LIBRARY_FORMAT = 'moway-route-library';
const ROUTE_LIBRARY_VERSION = 1;
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

function cleanText(value, fallback = '', maximumLength = 120) {
  const cleaned = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maximumLength);
  return cleaned || fallback;
}

function cleanId(value) {
  const id = cleanText(value, '', 128);
  return id || null;
}

function finiteInteger(value, fallback = 0, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(number)));
}

function safeLocation(location, index, label) {
  if (!location || typeof location !== 'object') {
    throw new AppError(`${label}中的第 ${index + 1} 个地点无效。`, 'ROUTE_IMPORT_INVALID');
  }
  const destinationId = Number(location.destinationId ?? location.id);
  const systemId = Number(location.systemId ?? location.id);
  if (!Number.isSafeInteger(destinationId) || destinationId <= 0
      || !Number.isSafeInteger(systemId) || systemId <= 0) {
    throw new AppError(`${label}中包含无效地点 ID。`, 'ROUTE_IMPORT_INVALID');
  }
  const type = ['solar_system', 'station', 'structure'].includes(location.type)
    ? location.type
    : 'solar_system';
  return {
    id: destinationId,
    destinationId,
    systemId,
    name: cleanText(location.name, `Location ${destinationId}`, 500),
    type,
  };
}

function safeExpandedSystem(system, index, label) {
  if (!system || typeof system !== 'object') {
    throw new AppError(`${label}中的第 ${index + 1} 个星系无效。`, 'ROUTE_IMPORT_INVALID');
  }
  const id = Number(system.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`${label}中包含无效星系 ID。`, 'ROUTE_IMPORT_INVALID');
  }
  return { id, name: cleanText(system.name, `System ${id}`, 500) };
}

function safeImportedRoute(route, index) {
  const label = `第 ${index + 1} 条路线`;
  if (!route || typeof route !== 'object') {
    throw new AppError(`${label}无效。`, 'ROUTE_IMPORT_INVALID');
  }
  if (!Array.isArray(route.stops) || route.stops.length < 2 || route.stops.length > 250) {
    throw new AppError(`${label}必须包含 2 至 250 个规划节点。`, 'ROUTE_IMPORT_INVALID');
  }
  if (!Array.isArray(route.expandedRoute) || route.expandedRoute.length < 1 || route.expandedRoute.length > 5000) {
    throw new AppError(`${label}的完整路线数据无效。`, 'ROUTE_IMPORT_INVALID');
  }
  if (!Array.isArray(route.exactDestinationIds) || route.exactDestinationIds.length > 5000) {
    throw new AppError(`${label}的精确路径点数据无效。`, 'ROUTE_IMPORT_INVALID');
  }
  const exactDestinationIds = route.exactDestinationIds.map((value) => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError(`${label}中包含无效路径点 ID。`, 'ROUTE_IMPORT_INVALID');
    }
    return id;
  });
  const preference = ['Shorter', 'Safer', 'LessSecure'].includes(route.preference)
    ? route.preference
    : 'Shorter';
  const now = new Date().toISOString();
  return {
    id: cleanId(route.id) || randomUUID(),
    name: cleanText(route.name, `Imported route ${index + 1}`, 120),
    stops: route.stops.map((stop, stopIndex) => safeLocation(stop, stopIndex, label)),
    preference,
    securityPenalty: finiteInteger(route.securityPenalty, 50, 0, 100),
    expandedRoute: route.expandedRoute.map((system, systemIndex) => safeExpandedSystem(system, systemIndex, label)),
    exactDestinationIds,
    jumps: finiteInteger(route.jumps, 0, 0, 1_000_000),
    optimizeOrder: Boolean(route.optimizeOrder),
    fixedDestination: route.fixedDestination !== false,
    optimizationOriginalJumps: route.optimizationOriginalJumps == null
      ? null
      : finiteInteger(route.optimizationOriginalJumps, 0, 0, 1_000_000),
    optimizationSavedJumps: finiteInteger(route.optimizationSavedJumps, 0, 0, 1_000_000),
    plannedAt: cleanText(route.plannedAt, now, 64),
    createdAt: cleanText(route.createdAt, now, 64),
    updatedAt: cleanText(route.updatedAt, now, 64),
    folderId: cleanId(route.folderId),
    sortOrder: finiteInteger(route.sortOrder, index, 0, 1_000_000),
  };
}

function safeExportRoute(route, index) {
  const stops = Array.isArray(route?.stops) ? route.stops : [];
  const expandedRoute = Array.isArray(route?.expandedRoute) && route.expandedRoute.length
    ? route.expandedRoute
    : stops.map((stop) => ({ id: Number(stop.systemId ?? stop.id), name: stop.name }));
  const exactDestinationIds = Array.isArray(route?.exactDestinationIds)
    ? route.exactDestinationIds
    : stops.slice(1).map((stop) => Number(stop.destinationId ?? stop.id));
  return safeImportedRoute({ ...route, expandedRoute, exactDestinationIds }, index);
}

function defaultData() {
  return {
    version: 3,
    settings: {
      clientId: '',
      contact: '',
      callbackUrl: CALLBACK_URL,
      theme: 'dark',
      language: 'zh-CN',
    },
    characters: [],
    characterFolders: [],
    routeFolders: [],
    savedRoutes: [],
  };
}

class LocalStore {
  constructor(filePath, safeStorage) {
    this.filePath = filePath;
    this.safeStorage = safeStorage;
    this.data = defaultData();
  }

  async load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      this.data = {
        ...defaultData(),
        ...parsed,
        settings: { ...defaultData().settings, ...(parsed.settings || {}) },
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        characterFolders: Array.isArray(parsed.characterFolders)
          ? parsed.characterFolders.map((folder, index) => ({
            id: cleanId(folder?.id) || randomUUID(),
            name: cleanText(folder?.name, `Character folder ${index + 1}`, 80),
            sortOrder: finiteInteger(folder?.sortOrder, index, 0, 1_000_000),
            createdAt: cleanText(folder?.createdAt, new Date().toISOString(), 64),
            updatedAt: cleanText(folder?.updatedAt, new Date().toISOString(), 64),
          }))
          : [],
        routeFolders: Array.isArray(parsed.routeFolders)
          ? parsed.routeFolders.map((folder, index) => ({
            id: cleanId(folder?.id) || randomUUID(),
            name: cleanText(folder?.name, `Folder ${index + 1}`, 80),
            sortOrder: finiteInteger(folder?.sortOrder, index, 0, 1_000_000),
            createdAt: cleanText(folder?.createdAt, new Date().toISOString(), 64),
            updatedAt: cleanText(folder?.updatedAt, new Date().toISOString(), 64),
          }))
          : [],
        savedRoutes: Array.isArray(parsed.savedRoutes) ? parsed.savedRoutes : [],
      };
      this.data.version = 3;
      const characterFolderIds = new Set(this.data.characterFolders.map((folder) => folder.id));
      this.data.characters = this.data.characters.map((character, index) => ({
        ...character,
        note: cleanText(character.note, '', 240),
        folderId: characterFolderIds.has(cleanId(character.folderId)) ? cleanId(character.folderId) : null,
        sortOrder: finiteInteger(character.sortOrder, index, 0, 1_000_000),
      }));
      const folderIds = new Set(this.data.routeFolders.map((folder) => folder.id));
      this.data.savedRoutes = this.data.savedRoutes.map((route, index) => ({
        ...route,
        folderId: folderIds.has(cleanId(route.folderId)) ? cleanId(route.folderId) : null,
        sortOrder: finiteInteger(route.sortOrder, index, 0, 1_000_000),
      }));
      this.normalizeCharacterOrdering();
      this.normalizeRouteOrdering();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.persist();
    }
    return this.publicState();
  }

  async persist() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(this.data, null, 2), {
      encoding: 'utf8',
      mode: 0o600,
    });
    await fs.rename(temporary, this.filePath);
  }

  publicState() {
    return {
      settings: { ...this.data.settings },
      characters: this.data.characters.map(({ encryptedRefreshToken, ...character }) => ({ ...character })),
      characterFolders: this.data.characterFolders
        .slice()
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((folder) => ({ ...folder })),
      routeFolders: this.data.routeFolders
        .slice()
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((folder) => ({ ...folder })),
      savedRoutes: this.data.savedRoutes.map((route) => ({ ...route })),
      security: {
        tokenEncryptionAvailable: this.safeStorage.isEncryptionAvailable(),
        storageLocation: this.filePath,
      },
    };
  }

  getSettings() {
    return { ...this.data.settings };
  }

  async saveSettings(settings) {
    this.data.settings.clientId = String(settings.clientId || '').trim();
    this.data.settings.contact = String(settings.contact || '').trim();
    await this.persist();
    return this.publicState();
  }

  async saveTheme(theme) {
    if (!['dark', 'light'].includes(theme)) throw new AppError('主题设置无效。', 'THEME_INVALID');
    this.data.settings.theme = theme;
    await this.persist();
    return this.publicState();
  }

  async saveLanguage(language) {
    if (!['zh-CN', 'en'].includes(language)) throw new AppError('语言设置无效。', 'LANGUAGE_INVALID');
    this.data.settings.language = language;
    await this.persist();
    return this.publicState();
  }

  encryptSecret(value) {
    if (!this.safeStorage.isEncryptionAvailable()) {
      throw new AppError(
        'Windows 安全存储当前不可用。为避免明文保存授权令牌，程序已停止绑定角色。',
        'SECURE_STORAGE_UNAVAILABLE',
      );
    }
    return this.safeStorage.encryptString(value).toString('base64');
  }

  decryptSecret(value) {
    try {
      return this.safeStorage.decryptString(Buffer.from(value, 'base64'));
    } catch {
      throw new AppError('无法解密该角色的本地授权，请移除后重新绑定。', 'TOKEN_DECRYPT_FAILED');
    }
  }

  getRefreshToken(characterId) {
    const record = this.data.characters.find((character) => character.characterId === String(characterId));
    if (!record) throw new AppError('未找到该角色的授权。', 'CHARACTER_NOT_FOUND');
    return this.decryptSecret(record.encryptedRefreshToken);
  }

  async upsertCharacter({ characterId, name, refreshToken, scopes, authorizedAt }) {
    const id = String(characterId);
    const existing = this.data.characters.find((character) => character.characterId === id);
    const record = {
      characterId: id,
      name,
      scopes: [...scopes],
      authorizedAt,
      lastOnline: null,
      lastCheckedAt: null,
      authState: 'valid',
      navigationEnabled: existing?.navigationEnabled ?? true,
      note: existing?.note || '',
      folderId: existing?.folderId || null,
      sortOrder: existing
        ? finiteInteger(existing.sortOrder)
        : this.data.characters.filter((character) => !character.folderId).length,
      encryptedRefreshToken: this.encryptSecret(refreshToken),
    };

    if (existing) Object.assign(existing, record);
    else this.data.characters.push(record);

    this.normalizeCharacterOrdering();
    await this.persist();
    return this.publicState();
  }

  async rotateRefreshToken(characterId, refreshToken) {
    const record = this.data.characters.find((character) => character.characterId === String(characterId));
    if (!record) return;
    record.encryptedRefreshToken = this.encryptSecret(refreshToken);
    record.authState = 'valid';
    await this.persist();
  }

  async updateCharacterStatus(characterId, patch) {
    const record = this.data.characters.find((character) => character.characterId === String(characterId));
    if (!record) return;
    Object.assign(record, patch);
    await this.persist();
  }

  async removeCharacter(characterId) {
    this.data.characters = this.data.characters.filter(
      (character) => character.characterId !== String(characterId),
    );
    this.normalizeCharacterOrdering();
    await this.persist();
    return this.publicState();
  }

  async setCharacterNavigationEnabled(characterId, enabled) {
    const record = this.data.characters.find((character) => character.characterId === String(characterId));
    if (!record) throw new AppError('未找到该角色。', 'CHARACTER_NOT_FOUND');
    record.navigationEnabled = Boolean(enabled);
    await this.persist();
    return this.publicState();
  }

  async setAllCharactersNavigationEnabled(enabled) {
    this.data.characters.forEach((character) => {
      character.navigationEnabled = Boolean(enabled);
    });
    await this.persist();
    return this.publicState();
  }

  normalizeCharacterOrdering() {
    const folderIds = [null, ...this.data.characterFolders.map((folder) => folder.id)];
    folderIds.forEach((folderId) => {
      this.data.characters
        .filter((character) => (character.folderId || null) === folderId)
        .sort((left, right) => finiteInteger(left.sortOrder) - finiteInteger(right.sortOrder))
        .forEach((character, index) => { character.sortOrder = index; });
    });
    this.data.characters.sort((left, right) => {
      const leftFolder = folderIds.indexOf(left.folderId || null);
      const rightFolder = folderIds.indexOf(right.folderId || null);
      return leftFolder - rightFolder || left.sortOrder - right.sortOrder;
    });
  }

  async createCharacterFolder(name) {
    const now = new Date().toISOString();
    this.data.characterFolders.push({
      id: randomUUID(),
      name: cleanText(name, `角色文件夹 ${this.data.characterFolders.length + 1}`, 80),
      sortOrder: this.data.characterFolders.length,
      createdAt: now,
      updatedAt: now,
    });
    await this.persist();
    return this.publicState();
  }

  async renameCharacterFolder(folderId, name) {
    const folder = this.data.characterFolders.find((item) => item.id === cleanId(folderId));
    if (!folder) throw new AppError('未找到该角色文件夹。', 'CHARACTER_FOLDER_NOT_FOUND');
    folder.name = cleanText(name, folder.name, 80);
    folder.updatedAt = new Date().toISOString();
    await this.persist();
    return this.publicState();
  }

  async deleteCharacterFolder(folderId) {
    const id = cleanId(folderId);
    if (!this.data.characterFolders.some((folder) => folder.id === id)) {
      throw new AppError('未找到该角色文件夹。', 'CHARACTER_FOLDER_NOT_FOUND');
    }
    this.data.characterFolders = this.data.characterFolders.filter((folder) => folder.id !== id);
    this.data.characterFolders.forEach((folder, index) => { folder.sortOrder = index; });
    this.data.characters.forEach((character) => {
      if (character.folderId === id) character.folderId = null;
    });
    this.normalizeCharacterOrdering();
    await this.persist();
    return this.publicState();
  }

  async setCharacterNote(characterId, note) {
    const character = this.data.characters.find((item) => item.characterId === String(characterId));
    if (!character) throw new AppError('未找到该角色。', 'CHARACTER_NOT_FOUND');
    character.note = cleanText(note, '', 240);
    await this.persist();
    return this.publicState();
  }

  async moveCharacter(characterId, folderId, beforeCharacterId = null) {
    const id = String(characterId);
    const targetFolderId = cleanId(folderId);
    const character = this.data.characters.find((item) => item.characterId === id);
    if (!character) throw new AppError('未找到该角色。', 'CHARACTER_NOT_FOUND');
    if (targetFolderId && !this.data.characterFolders.some((folder) => folder.id === targetFolderId)) {
      throw new AppError('未找到目标角色文件夹。', 'CHARACTER_FOLDER_NOT_FOUND');
    }
    const sourceFolderId = character.folderId || null;
    const targetCharacters = this.data.characters
      .filter((item) => item.characterId !== id && (item.folderId || null) === targetFolderId)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const beforeId = beforeCharacterId == null ? null : String(beforeCharacterId);
    const insertionIndex = beforeId
      ? targetCharacters.findIndex((item) => item.characterId === beforeId)
      : -1;
    character.folderId = targetFolderId;
    targetCharacters.splice(insertionIndex >= 0 ? insertionIndex : targetCharacters.length, 0, character);
    targetCharacters.forEach((item, index) => { item.sortOrder = index; });
    if (sourceFolderId !== targetFolderId) {
      this.data.characters
        .filter((item) => item.characterId !== id && (item.folderId || null) === sourceFolderId)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .forEach((item, index) => { item.sortOrder = index; });
    }
    this.normalizeCharacterOrdering();
    await this.persist();
    return this.publicState();
  }

  normalizeRouteOrdering() {
    const folderIds = [null, ...this.data.routeFolders.map((folder) => folder.id)];
    folderIds.forEach((folderId) => {
      this.data.savedRoutes
        .filter((route) => (route.folderId || null) === folderId)
        .sort((left, right) => finiteInteger(left.sortOrder) - finiteInteger(right.sortOrder))
        .forEach((route, index) => { route.sortOrder = index; });
    });
    this.data.savedRoutes.sort((left, right) => {
      const leftFolder = folderIds.indexOf(left.folderId || null);
      const rightFolder = folderIds.indexOf(right.folderId || null);
      return leftFolder - rightFolder || left.sortOrder - right.sortOrder;
    });
  }

  async createRouteFolder(name) {
    const now = new Date().toISOString();
    const folder = {
      id: randomUUID(),
      name: cleanText(name, `新文件夹 ${this.data.routeFolders.length + 1}`, 80),
      sortOrder: this.data.routeFolders.length,
      createdAt: now,
      updatedAt: now,
    };
    this.data.routeFolders.push(folder);
    await this.persist();
    return this.publicState();
  }

  async renameRouteFolder(folderId, name) {
    const folder = this.data.routeFolders.find((item) => item.id === cleanId(folderId));
    if (!folder) throw new AppError('未找到该路线文件夹。', 'ROUTE_FOLDER_NOT_FOUND');
    folder.name = cleanText(name, folder.name, 80);
    folder.updatedAt = new Date().toISOString();
    await this.persist();
    return this.publicState();
  }

  async deleteRouteFolder(folderId) {
    const id = cleanId(folderId);
    if (!this.data.routeFolders.some((folder) => folder.id === id)) {
      throw new AppError('未找到该路线文件夹。', 'ROUTE_FOLDER_NOT_FOUND');
    }
    this.data.routeFolders = this.data.routeFolders.filter((folder) => folder.id !== id);
    this.data.routeFolders.forEach((folder, index) => { folder.sortOrder = index; });
    this.data.savedRoutes.forEach((route) => {
      if (route.folderId === id) route.folderId = null;
    });
    this.normalizeRouteOrdering();
    await this.persist();
    return this.publicState();
  }

  async saveRoute(route) {
    const now = new Date().toISOString();
    const id = route.id || randomUUID();
    const existingIndex = this.data.savedRoutes.findIndex((item) => item.id === id);
    const requestedFolderId = cleanId(route.folderId);
    const targetFolderId = this.data.routeFolders.some((folder) => folder.id === requestedFolderId)
      ? requestedFolderId
      : null;
    const existingRoute = existingIndex >= 0 ? this.data.savedRoutes[existingIndex] : null;
    const staysInFolder = existingRoute && (existingRoute.folderId || null) === targetFolderId;
    const record = {
      ...route,
      id,
      name: String(route.name || '').trim() || `未命名路线 ${this.data.savedRoutes.length + 1}`,
      folderId: targetFolderId,
      sortOrder: staysInFolder
        ? finiteInteger(existingRoute.sortOrder)
        : this.data.savedRoutes.filter((item) => item.id !== id && (item.folderId || null) === targetFolderId).length,
      updatedAt: now,
      createdAt: route.createdAt || now,
    };
    if (existingIndex >= 0) this.data.savedRoutes[existingIndex] = record;
    else this.data.savedRoutes.push(record);
    this.normalizeRouteOrdering();
    await this.persist();
    return record;
  }

  async renameRoute(routeId, name) {
    const route = this.data.savedRoutes.find((item) => item.id === cleanId(routeId));
    if (!route) throw new AppError('未找到该路线。', 'ROUTE_NOT_FOUND');
    route.name = cleanText(name, route.name, 120);
    route.updatedAt = new Date().toISOString();
    await this.persist();
    return this.publicState();
  }

  async moveRoute(routeId, folderId, beforeRouteId = null) {
    const id = cleanId(routeId);
    const targetFolderId = cleanId(folderId);
    const route = this.data.savedRoutes.find((item) => item.id === id);
    if (!route) throw new AppError('未找到该路线。', 'ROUTE_NOT_FOUND');
    if (targetFolderId && !this.data.routeFolders.some((folder) => folder.id === targetFolderId)) {
      throw new AppError('未找到目标路线文件夹。', 'ROUTE_FOLDER_NOT_FOUND');
    }
    const sourceFolderId = route.folderId || null;
    const targetRoutes = this.data.savedRoutes
      .filter((item) => item.id !== id && (item.folderId || null) === targetFolderId)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const beforeId = cleanId(beforeRouteId);
    const insertionIndex = beforeId
      ? targetRoutes.findIndex((item) => item.id === beforeId)
      : -1;
    route.folderId = targetFolderId;
    targetRoutes.splice(insertionIndex >= 0 ? insertionIndex : targetRoutes.length, 0, route);
    targetRoutes.forEach((item, index) => { item.sortOrder = index; });
    if (sourceFolderId !== targetFolderId) {
      this.data.savedRoutes
        .filter((item) => item.id !== id && (item.folderId || null) === sourceFolderId)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .forEach((item, index) => { item.sortOrder = index; });
    }
    this.normalizeRouteOrdering();
    await this.persist();
    return this.publicState();
  }

  async deleteRoute(routeId) {
    this.data.savedRoutes = this.data.savedRoutes.filter((route) => route.id !== routeId);
    this.normalizeRouteOrdering();
    await this.persist();
    return this.publicState();
  }

  exportRouteLibrary() {
    return {
      format: ROUTE_LIBRARY_FORMAT,
      version: ROUTE_LIBRARY_VERSION,
      exportedAt: new Date().toISOString(),
      folders: this.data.routeFolders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        sortOrder: folder.sortOrder,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      })),
      routes: this.data.savedRoutes.map((route, index) => safeExportRoute(route, index)),
    };
  }

  async importRouteLibrary(library) {
    if (!library || typeof library !== 'object' || library.format !== ROUTE_LIBRARY_FORMAT) {
      throw new AppError('这不是有效的 MOWAY 路线库文件。', 'ROUTE_IMPORT_INVALID');
    }
    if (library.version !== ROUTE_LIBRARY_VERSION) {
      throw new AppError('该路线库版本暂不受支持。', 'ROUTE_IMPORT_VERSION');
    }
    if (!Array.isArray(library.folders) || !Array.isArray(library.routes)
        || library.folders.length > 500 || library.routes.length > 5000) {
      throw new AppError('路线库内容过大或格式无效。', 'ROUTE_IMPORT_INVALID');
    }
    const now = new Date().toISOString();
    const importedFolders = library.folders.map((folder, index) => {
      if (!folder || typeof folder !== 'object') {
        throw new AppError(`第 ${index + 1} 个路线文件夹无效。`, 'ROUTE_IMPORT_INVALID');
      }
      return {
        id: cleanId(folder.id) || randomUUID(),
        name: cleanText(folder.name, `Imported folder ${index + 1}`, 80),
        sortOrder: finiteInteger(folder.sortOrder, index, 0, 1_000_000),
        createdAt: cleanText(folder.createdAt, now, 64),
        updatedAt: cleanText(folder.updatedAt, now, 64),
      };
    });
    const importedFolderIds = new Set(importedFolders.map((folder) => folder.id));
    const existingFolderIds = new Set(this.data.routeFolders.map((folder) => folder.id));
    importedFolders.forEach((folder) => {
      const existingIndex = this.data.routeFolders.findIndex((item) => item.id === folder.id);
      if (existingIndex >= 0) this.data.routeFolders[existingIndex] = folder;
      else this.data.routeFolders.push(folder);
      existingFolderIds.add(folder.id);
    });
    const importedRoutes = library.routes.map((route, index) => {
      const record = safeImportedRoute(route, index);
      if (record.folderId && !importedFolderIds.has(record.folderId) && !existingFolderIds.has(record.folderId)) {
        record.folderId = null;
      }
      return record;
    });
    importedRoutes.forEach((route) => {
      const existingIndex = this.data.savedRoutes.findIndex((item) => item.id === route.id);
      if (existingIndex >= 0) this.data.savedRoutes[existingIndex] = route;
      else this.data.savedRoutes.push(route);
    });
    this.data.routeFolders
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .forEach((folder, index) => { folder.sortOrder = index; });
    this.normalizeRouteOrdering();
    await this.persist();
    return {
      state: this.publicState(),
      importedRoutes: importedRoutes.length,
      importedFolders: importedFolders.length,
    };
  }
}

module.exports = {
  LocalStore,
  defaultData,
  MAX_IMPORT_BYTES,
  ROUTE_LIBRARY_FORMAT,
  ROUTE_LIBRARY_VERSION,
};
