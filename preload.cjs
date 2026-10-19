'use strict';

const { clipboard, contextBridge, ipcRenderer } = require('electron');

async function invoke(channel, payload) {
  const result = await ipcRenderer.invoke(channel, payload);
  if (!result?.ok) {
    const error = new Error(result?.error?.message || '操作失败');
    error.code = result?.error?.code || 'APP_ERROR';
    error.details = result?.error?.details || null;
    throw error;
  }
  return result.data;
}

contextBridge.exposeInMainWorld('navigatorApi', Object.freeze({
  getState: () => invoke('state:get'),
  saveSettings: (settings) => invoke('settings:save', settings),
  setTheme: (theme) => invoke('settings:set-theme', { theme }),
  setLanguage: (language) => invoke('settings:set-language', { language }),
  beginAuthorization: () => invoke('auth:begin'),
  removeCharacter: (characterId) => invoke('character:remove', { characterId }),
  setCharacterNavigation: (characterId, enabled) => invoke('character:set-navigation', { characterId, enabled }),
  setCharacterNote: (characterId, note) => invoke('character:set-note', { characterId, note }),
  moveCharacter: (characterId, folderId, beforeCharacterId = null) => invoke('character:move', {
    characterId,
    folderId,
    beforeCharacterId,
  }),
  createCharacterFolder: (name) => invoke('character-folder:create', { name }),
  renameCharacterFolder: (folderId, name) => invoke('character-folder:rename', { folderId, name }),
  deleteCharacterFolder: (folderId) => invoke('character-folder:delete', { folderId }),
  setAllCharacterNavigation: (enabled) => invoke('characters:set-all-navigation', { enabled }),
  refreshCharacters: () => invoke('characters:refresh'),
  searchLocations: (query) => invoke('location:search', { query }),
  planRoute: (request) => invoke('route:plan', request),
  saveRoute: (route) => invoke('route:save', route),
  renameRoute: (routeId, name) => invoke('route:rename', { routeId, name }),
  moveRoute: (routeId, folderId, beforeRouteId = null) => invoke('route:move', {
    routeId,
    folderId,
    beforeRouteId,
  }),
  deleteRoute: (routeId) => invoke('route:delete', { routeId }),
  createRouteFolder: (name) => invoke('route-folder:create', { name }),
  renameRouteFolder: (folderId, name) => invoke('route-folder:rename', { folderId, name }),
  deleteRouteFolder: (folderId) => invoke('route-folder:delete', { folderId }),
  exportRouteLibrary: () => invoke('route-library:export'),
  importRouteLibrary: () => invoke('route-library:import'),
  applyRoute: (route, mode) => invoke('route:apply', { route, mode }),
  openDevelopers: () => invoke('external:open-developers'),
  copyText: (value) => clipboard.writeText(String(value || '')),
}));
