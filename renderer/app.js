'use strict';

const api = window.navigatorApi;

const translations = {
  'zh-CN': {
    'nav.aria': '主导航', 'nav.planner': '路线规划', 'nav.saved': '已保存路线', 'nav.pilots': '导航角色', 'nav.settings': '设置与安全',
    'footer.line1': '作者 Mo Freeman · 版本 V0.9527', 'footer.line2': '可能不会更新 V1.0',
    'view.planner': '规划你的航线', 'view.saved': '已保存路线', 'view.pilots': '导航角色', 'view.settings': '设置与安全',
    'language.switch': 'Switch to English', 'theme.toLight': '☀ 白底', 'theme.toDark': '☾ 深色', 'theme.title': '切换深色 / 白底主题',
    'planner.nodesKicker': '01 · 航线节点', 'planner.startQuestion': '从哪里出发？', 'planner.swap': '交换起终点', 'planner.addStop': '添加途经点',
    'planner.preferenceKicker': '02 · 路线偏好', 'planner.arriveQuestion': '如何抵达？', 'planner.securityWeight': '安全权重', 'planner.securityWeightNote': '数值越高，越倾向避开危险星系',
    'planner.calculate': '计算航线', 'planner.searchNote': '输入至少 3 个字符即可联想星系、NPC 空间站或角色可见的玩家建筑。',
    'preference.shorter': '最短路线', 'preference.shorterNote': '跳数优先', 'preference.safer': '更安全', 'preference.saferNote': '偏好高安', 'preference.lessSecure': '更危险', 'preference.lessSecureNote': '偏好低安 / 零安',
    'preference.shorterShort': '最短', 'preference.saferShort': '更安全', 'preference.lessSecureShort': '更危险',
    'optimizer.title': '自动优化停靠顺序', 'optimizer.note': '固定起点，以总跳数最少为目标；推荐不超过 10 个，最多 15 个，节点越多等待越久',
    'optimizer.fixedDestination': '固定终点', 'optimizer.fixedDestinationNote': '关闭后，原终点也会参与自动排序', 'optimizer.destinationSorted': '终点参与排序',
    'preview.waiting': '等待计算航线', 'preview.waitingNote': '输入起点、终点与途经点后，路线会在这里展开。',
    'saved.title': '你的路线库', 'saved.note': '用文件夹归类路线，拖动调整顺序，并可导入或导出备份。', 'saved.empty': '还没有保存的路线。先去“路线规划”计算一条航线吧。',
    'saved.import': '导入路线', 'saved.export': '导出路线库', 'saved.createFolder': '＋ 新建文件夹', 'saved.unfiled': '未归类路线', 'saved.folderEmpty': '将路线拖到这里',
    'saved.folderCount': '{count} 条路线', 'saved.folderCountOne': '1 条路线', 'saved.folderNamePrompt': '输入新文件夹名称', 'saved.folderRenamePrompt': '重命名路线文件夹', 'saved.folderDeleteConfirm': '删除文件夹“{name}”？其中的路线会移动到“未归类路线”。',
    'saved.folderCreated': '路线文件夹已创建。', 'saved.folderRenamed': '路线文件夹已重命名。', 'saved.folderDeleted': '文件夹已删除，其中的路线已移至未归类。',
    'saved.exported': '路线库已导出为 {file}。', 'saved.imported': '已从 {file} 导入 {routes} 条路线和 {folders} 个文件夹。',
    'pilots.title': '导航角色', 'pilots.note': '为角色添加备注和文件夹，拖动调整顺序；每个角色仍需单独授权。', 'pilots.selectAll': '全选', 'pilots.clear': '清空', 'pilots.refresh': '刷新在线状态', 'pilots.bind': '＋ 绑定角色',
    'pilots.createFolder': '＋ 新建文件夹', 'pilots.unfiled': '未归类角色', 'pilots.folderEmpty': '将角色拖到这里', 'pilots.folderCount': '{count} 个角色', 'pilots.folderCountOne': '1 个角色',
    'pilots.folderNamePrompt': '输入角色文件夹名称', 'pilots.folderRenamePrompt': '重命名角色文件夹', 'pilots.folderDeleteConfirm': '删除文件夹“{name}”？其中的角色会移动到“未归类角色”。',
    'pilots.folderCreated': '角色文件夹已创建。', 'pilots.folderRenamed': '角色文件夹已重命名。', 'pilots.folderDeleted': '文件夹已删除，其中的角色已移至未归类。',
    'pilot.note': '备注', 'pilot.notePrompt': '输入角色备注；留空可清除', 'pilot.noNote': '暂无备注', 'pilot.noteUpdated': '角色备注已更新。', 'pilot.drag': '拖动角色',
    'pilots.passwordTitle': '你的密码不会进入本程序', 'pilots.passwordNote': '登录发生在系统浏览器的 EVE 官方 SSO 页面；这里只保存 Windows 加密后的授权令牌。', 'pilots.viewBound': '查看绑定角色',
    'settings.title': '应用配置', 'settings.note': '先在 EVE Developers 创建一个原生应用，再把公开的 Client ID 填到这里。不要填写 Client Secret。',
    'settings.clientIdPlaceholder': '粘贴 EVE 应用 Client ID', 'settings.contact': 'User-Agent 联系方式', 'settings.recommended': '建议填写', 'settings.contactPlaceholder': '邮箱或 Discord，例如 you@example.com',
    'settings.callback': '回调地址', 'settings.exactMatch': '必须逐字一致', 'settings.copy': '复制', 'settings.openDevelopers': '打开 EVE Developers', 'settings.save': '保存配置',
    'setup.title': '注册步骤', 'setup.createTitle': '创建应用', 'setup.createNote': '类型选择 Authentication & API Access。', 'setup.callbackTitle': '填写回调', 'setup.callbackNote': '复制左侧回调地址，不要修改端口。',
    'setup.scopesTitle': '最小权限', 'setup.saveTitle': '保存 Client ID', 'setup.saveNote': '桌面 PKCE 流程不使用 Client Secret。',
    'privacy.title': '安全边界', 'privacy.noPassword': '无密码接触', 'privacy.noPasswordNote': '应用不会读取、传输或保存 EVE 密码和浏览器 Cookie。',
    'privacy.encrypted': '本机加密', 'privacy.encryptedNote': '刷新令牌经 Windows 安全存储加密，访问令牌仅驻留内存。', 'privacy.noCloud': '无云同步', 'privacy.noCloudNote': '角色绑定和保存路线只存放在本机应用数据目录。',
    'privacy.revoke': '可随时撤销', 'privacy.revokeNote': '可在本程序移除角色，也可在 EVE 官方网站撤销授权。', 'privacy.storageLocation': '本地数据位置：',
    'saveModal.title': '保存这条航线', 'saveModal.name': '路线名称', 'saveModal.folder': '保存到文件夹', 'common.cancel': '取消', 'common.save': '保存', 'common.rename': '重命名', 'common.create': '创建',
    'location.solar_system': '星系', 'location.station': 'NPC 空间站', 'location.structure': '玩家建筑',
    'date.never': '尚未检查', 'suggestion.none': '没有找到匹配地点', 'suggestion.bindFirst': '绑定至少一个角色后可使用地点联想', 'suggestion.searching': '正在搜索…',
    'stop.start': '起点', 'stop.end': '终点', 'stop.via': '途经点 {index}', 'stop.placeholder': '星系、空间站或玩家建筑', 'stop.delete': '删除途经点', 'stop.drag': '拖动调整途经点顺序',
    'route.hiddenSystems': '··· 中间还有 {count} 个星系 ···', 'route.plannedStop': '规划节点', 'route.jumpIndex': '第 {index} 跳',
    'route.totalJumps': '总跳数', 'route.legs': '航段', 'route.preference': '规划偏好', 'route.optimized': 'OPTIMIZED ORDER · {destination} · 节省 {count} 跳',
    'route.modeStops': '仅写入规划停靠点', 'route.modeExact': '逐跳锁定完整路线', 'route.apply': '写入已选在线角色', 'route.save': '保存路线',
    'route.applyHint': '仅处理已勾选角色，离线角色自动跳过。逐跳模式会产生 {count} 次 / 角色的 ESI 写入。',
    'route.savedSummary': '{jumps} 跳 · {legs} 个航段{optimized} · {date}', 'route.savedOptimized': ' · 已优化省 {count} 跳', 'route.load': '载入规划器', 'route.applySelected': '写入已选角色', 'route.delete': '删除', 'route.rename': '重命名路线', 'route.drag': '拖动路线',
    'route.renamePrompt': '输入新的路线名称', 'route.renamed': '路线已重命名。',
    'route.deleteConfirm': '删除路线“{name}”？', 'route.deleted': '路线已删除。', 'route.loaded': '路线已载入规划器。', 'route.calculating': '正在计算',
    'route.calculated': '航线计算完成，共 {jumps} 跳{optimized}。', 'route.optimizedSaved': '，自动优化节省 {count} 跳', 'route.writeConfirm': '逐跳模式预计产生约 {count} 次 ESI 写入。继续吗？',
    'route.writing': '正在写入', 'route.applySuccess': '已为 {success} 个在线角色设置导航；跳过 {offline} 个离线角色。', 'route.noneOnline': '没有在线角色，已跳过 {count} 个离线角色。', 'route.applyFailed': '{count} 个角色写入失败：{names}',
    'route.saving': '正在保存', 'route.saved': '路线已保存到本机。',
    'pilot.empty': '尚未绑定角色。配置 Client ID 后，使用 EVE 官方 SSO 完成授权。', 'pilot.characterId': '角色 ID {id}', 'pilot.navigation': '参与导航', 'pilot.reauthorize': '重新授权', 'pilot.remove': '移除',
    'pilot.removeConfirm': '移除角色“{name}”的本地授权？', 'pilot.removed': '角色授权已从本机移除。', 'pilot.authExpired': '授权失效', 'pilot.checkFailed': '检查失败', 'pilot.online': '在线', 'pilot.offline': '离线', 'pilot.unknown': '未知',
    'pilot.selectingAll': '正在全选', 'pilot.clearing': '正在清空', 'pilot.waitingAuth': '等待浏览器授权', 'pilot.bound': '角色已安全绑定。', 'pilot.checking': '正在检查', 'pilot.refreshed': '在线状态已刷新。',
    'security.localEncrypted': '本地加密', 'security.unavailable': '加密不可用', 'security.windowsProtected': '令牌由 Windows 保护', 'security.bindingDisabled': '角色绑定已禁用',
    'settings.saving': '正在保存', 'settings.saved': '配置已保存。Client Secret 不会被使用。', 'settings.clientIdFirst': '请先配置 EVE 应用 Client ID。', 'settings.callbackCopied': '回调地址已复制。',
    'startup.firstUse': '首次使用：请先在“设置与安全”中配置 EVE Client ID。', 'error.buttonNotReady': '操作按钮尚未准备好，请重新打开当前页面后再试。', 'error.generic': '操作失败，请稍后重试。',
  },
  en: {
    'nav.aria': 'Main navigation', 'nav.planner': 'Route Planner', 'nav.saved': 'Saved Routes', 'nav.pilots': 'Navigation Characters', 'nav.settings': 'Settings & Security',
    'footer.line1': 'Author Mo Freeman · Version V0.9527', 'footer.line2': 'V1.0 may never happen',
    'view.planner': 'Plan Your Route', 'view.saved': 'Saved Routes', 'view.pilots': 'Navigation Characters', 'view.settings': 'Settings & Security',
    'language.switch': '切换到中文', 'theme.toLight': '☀ Light', 'theme.toDark': '☾ Dark', 'theme.title': 'Switch dark / light theme',
    'planner.nodesKicker': '01 · ROUTE STOPS', 'planner.startQuestion': 'Where are you starting?', 'planner.swap': 'Swap endpoints', 'planner.addStop': 'Add waypoint',
    'planner.preferenceKicker': '02 · ROUTE PREFERENCE', 'planner.arriveQuestion': 'How should we get there?', 'planner.securityWeight': 'Security weighting', 'planner.securityWeightNote': 'Higher values avoid dangerous systems more strongly',
    'planner.calculate': 'Calculate Route', 'planner.searchNote': 'Enter at least 3 characters to find solar systems, NPC stations, or character-visible player structures.',
    'preference.shorter': 'Shortest', 'preference.shorterNote': 'Fewest jumps', 'preference.safer': 'Safer', 'preference.saferNote': 'Prefer high-sec', 'preference.lessSecure': 'Less secure', 'preference.lessSecureNote': 'Prefer low-sec / null-sec',
    'preference.shorterShort': 'Shortest', 'preference.saferShort': 'Safer', 'preference.lessSecureShort': 'Less secure',
    'optimizer.title': 'Optimize stop order', 'optimizer.note': 'Keeps the start fixed and minimizes total jumps; 10 stops or fewer recommended, 15 maximum. More stops take longer.',
    'optimizer.fixedDestination': 'Keep destination fixed', 'optimizer.fixedDestinationNote': 'Turn off to include the original destination in automatic ordering', 'optimizer.destinationSorted': 'Destination included',
    'preview.waiting': 'Waiting to calculate a route', 'preview.waitingNote': 'Choose a start, destination, and optional waypoints to see the route here.',
    'saved.title': 'Your Route Library', 'saved.note': 'Organize routes in folders, drag to reorder, and import or export backups.', 'saved.empty': 'No saved routes yet. Calculate one in Route Planner first.',
    'saved.import': 'Import Routes', 'saved.export': 'Export Library', 'saved.createFolder': '＋ New Folder', 'saved.unfiled': 'Unfiled Routes', 'saved.folderEmpty': 'Drop routes here',
    'saved.folderCount': '{count} routes', 'saved.folderCountOne': '1 route', 'saved.folderNamePrompt': 'Enter a new folder name', 'saved.folderRenamePrompt': 'Rename route folder', 'saved.folderDeleteConfirm': 'Delete “{name}”? Its routes will be moved to Unfiled Routes.',
    'saved.folderCreated': 'Route folder created.', 'saved.folderRenamed': 'Route folder renamed.', 'saved.folderDeleted': 'Folder deleted; its routes were moved to Unfiled Routes.',
    'saved.exported': 'Route library exported as {file}.', 'saved.imported': 'Imported {routes} routes and {folders} folders from {file}.',
    'pilots.title': 'Navigation Characters', 'pilots.note': 'Add notes and folders, then drag characters into your preferred order. Each character is still authorized separately.', 'pilots.selectAll': 'Select All', 'pilots.clear': 'Clear', 'pilots.refresh': 'Refresh Online Status', 'pilots.bind': '＋ Bind Character',
    'pilots.createFolder': '＋ New Folder', 'pilots.unfiled': 'Unfiled Characters', 'pilots.folderEmpty': 'Drop characters here', 'pilots.folderCount': '{count} characters', 'pilots.folderCountOne': '1 character',
    'pilots.folderNamePrompt': 'Enter a character-folder name', 'pilots.folderRenamePrompt': 'Rename character folder', 'pilots.folderDeleteConfirm': 'Delete “{name}”? Its characters will be moved to Unfiled Characters.',
    'pilots.folderCreated': 'Character folder created.', 'pilots.folderRenamed': 'Character folder renamed.', 'pilots.folderDeleted': 'Folder deleted; its characters were moved to Unfiled Characters.',
    'pilot.note': 'Note', 'pilot.notePrompt': 'Enter a character note; leave blank to clear it', 'pilot.noNote': 'No note', 'pilot.noteUpdated': 'Character note updated.', 'pilot.drag': 'Drag character',
    'pilots.passwordTitle': 'Your password never enters this app', 'pilots.passwordNote': 'Sign-in happens on the official EVE SSO page in your system browser. Only the Windows-encrypted authorization token is stored here.', 'pilots.viewBound': 'View bound characters',
    'settings.title': 'Application Configuration', 'settings.note': 'Create a native application in EVE Developers, then enter its public Client ID here. Do not enter a Client Secret.',
    'settings.clientIdPlaceholder': 'Paste the EVE application Client ID', 'settings.contact': 'User-Agent contact', 'settings.recommended': 'recommended', 'settings.contactPlaceholder': 'Email or Discord, e.g. you@example.com',
    'settings.callback': 'Callback URL', 'settings.exactMatch': 'must match exactly', 'settings.copy': 'Copy', 'settings.openDevelopers': 'Open EVE Developers', 'settings.save': 'Save Configuration',
    'setup.title': 'Registration Steps', 'setup.createTitle': 'Create an application', 'setup.createNote': 'Select Authentication & API Access.', 'setup.callbackTitle': 'Enter the callback', 'setup.callbackNote': 'Copy the callback URL on the left without changing the port.',
    'setup.scopesTitle': 'Minimum scopes', 'setup.saveTitle': 'Save the Client ID', 'setup.saveNote': 'The desktop PKCE flow does not use a Client Secret.',
    'privacy.title': 'Security Boundaries', 'privacy.noPassword': 'No password access', 'privacy.noPasswordNote': 'The app does not read, transmit, or store your EVE password or browser cookies.',
    'privacy.encrypted': 'Local encryption', 'privacy.encryptedNote': 'Refresh tokens use Windows secure storage; access tokens remain in memory only.', 'privacy.noCloud': 'No cloud sync', 'privacy.noCloudNote': 'Character bindings and saved routes stay in the local app data folder.',
    'privacy.revoke': 'Revocable anytime', 'privacy.revokeNote': 'Remove a character here or revoke access on the official EVE website.', 'privacy.storageLocation': 'Local data location: ',
    'saveModal.title': 'Save This Route', 'saveModal.name': 'Route name', 'saveModal.folder': 'Save to folder', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.rename': 'Rename', 'common.create': 'Create',
    'location.solar_system': 'Solar System', 'location.station': 'NPC Station', 'location.structure': 'Player Structure',
    'date.never': 'Never checked', 'suggestion.none': 'No matching locations found', 'suggestion.bindFirst': 'Bind at least one character to use location suggestions', 'suggestion.searching': 'Searching…',
    'stop.start': 'Start', 'stop.end': 'Destination', 'stop.via': 'Waypoint {index}', 'stop.placeholder': 'Solar system, station, or player structure', 'stop.delete': 'Delete waypoint', 'stop.drag': 'Drag to reorder waypoint',
    'route.hiddenSystems': '··· {count} more systems ···', 'route.plannedStop': 'Planned stop', 'route.jumpIndex': 'Jump {index}',
    'route.totalJumps': 'Total jumps', 'route.legs': 'Legs', 'route.preference': 'Preference', 'route.optimized': 'OPTIMIZED ORDER · {destination} · {count} JUMPS SAVED',
    'route.modeStops': 'Write planned stops only', 'route.modeExact': 'Lock the complete route jump by jump', 'route.apply': 'Send to Selected Online Characters', 'route.save': 'Save Route',
    'route.applyHint': 'Only selected characters are processed; offline characters are skipped. Jump-by-jump mode makes {count} ESI writes per character.',
    'route.savedSummary': '{jumps} jumps · {legs} legs{optimized} · {date}', 'route.savedOptimized': ' · {count} jumps saved', 'route.load': 'Load in Planner', 'route.applySelected': 'Send to Selected Characters', 'route.delete': 'Delete', 'route.rename': 'Rename route', 'route.drag': 'Drag route',
    'route.renamePrompt': 'Enter a new route name', 'route.renamed': 'Route renamed.',
    'route.deleteConfirm': 'Delete route “{name}”?', 'route.deleted': 'Route deleted.', 'route.loaded': 'Route loaded in the planner.', 'route.calculating': 'Calculating',
    'route.calculated': 'Route calculated: {jumps} jumps{optimized}.', 'route.optimizedSaved': ', {count} jumps saved by optimization', 'route.writeConfirm': 'Jump-by-jump mode will make about {count} ESI writes. Continue?',
    'route.writing': 'Writing', 'route.applySuccess': 'Navigation set for {success} online characters; {offline} offline characters skipped.', 'route.noneOnline': 'No characters are online; {count} offline characters skipped.', 'route.applyFailed': 'Failed to write to {count} characters: {names}',
    'route.saving': 'Saving', 'route.saved': 'Route saved locally.',
    'pilot.empty': 'No characters are bound. Configure a Client ID, then authorize with official EVE SSO.', 'pilot.characterId': 'Character ID {id}', 'pilot.navigation': 'Use for navigation', 'pilot.reauthorize': 'Reauthorize', 'pilot.remove': 'Remove',
    'pilot.removeConfirm': 'Remove the local authorization for “{name}”?', 'pilot.removed': 'Character authorization removed from this PC.', 'pilot.authExpired': 'Authorization expired', 'pilot.checkFailed': 'Check failed', 'pilot.online': 'Online', 'pilot.offline': 'Offline', 'pilot.unknown': 'Unknown',
    'pilot.selectingAll': 'Selecting all', 'pilot.clearing': 'Clearing', 'pilot.waitingAuth': 'Waiting for browser authorization', 'pilot.bound': 'Character bound securely.', 'pilot.checking': 'Checking', 'pilot.refreshed': 'Online status refreshed.',
    'security.localEncrypted': 'Local encryption', 'security.unavailable': 'Encryption unavailable', 'security.windowsProtected': 'Tokens protected by Windows', 'security.bindingDisabled': 'Character binding disabled',
    'settings.saving': 'Saving', 'settings.saved': 'Configuration saved. Client Secret is not used.', 'settings.clientIdFirst': 'Configure an EVE application Client ID first.', 'settings.callbackCopied': 'Callback URL copied.',
    'startup.firstUse': 'First use: configure an EVE Client ID in Settings & Security.', 'error.buttonNotReady': 'This action is not ready. Reopen the current page and try again.', 'error.generic': 'The operation failed. Please try again later.',
  },
};

const state = {
  app: null,
  view: 'planner',
  draftStops: [
    { text: 'Jita', resolved: null },
    { text: 'Amarr', resolved: null },
  ],
  preference: 'Shorter',
  securityPenalty: 50,
  optimizeOrder: false,
  fixedDestination: true,
  plannedRoute: null,
  applyMode: 'stops',
  language: 'zh-CN',
};

let textPromptResolver = null;
let textPromptAllowsEmpty = false;

const viewLabels = {
  planner: ['ROUTE PLANNER', 'view.planner'],
  saved: ['ROUTE LIBRARY', 'view.saved'],
  pilots: ['CHARACTER ACCESS', 'view.pilots'],
  settings: ['SETTINGS & PRIVACY', 'view.settings'],
};

function t(key, values = {}) {
  let message = translations[state.language]?.[key] ?? translations['zh-CN'][key] ?? key;
  for (const [name, value] of Object.entries(values)) message = message.replaceAll(`{${name}}`, String(value));
  return message;
}

function closeTextPrompt(value = null) {
  const resolver = textPromptResolver;
  textPromptResolver = null;
  textPromptAllowsEmpty = false;
  document.querySelector('#textPromptModal').classList.add('hidden');
  document.querySelector('#textPromptInput').value = '';
  resolver?.(value);
}

function requestText({ title, label, value = '', confirmLabel, maximumLength = 120, allowEmpty = false }) {
  if (textPromptResolver) closeTextPrompt(null);
  return new Promise((resolve) => {
    textPromptResolver = resolve;
    textPromptAllowsEmpty = allowEmpty;
    document.querySelector('#textPromptTitle').textContent = title;
    document.querySelector('#textPromptLabel').textContent = label;
    const input = document.querySelector('#textPromptInput');
    input.maxLength = maximumLength;
    input.value = value;
    document.querySelector('#confirmTextPrompt').textContent = confirmLabel;
    document.querySelector('#textPromptModal').classList.remove('hidden');
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  });
}

function submitTextPrompt() {
  const input = document.querySelector('#textPromptInput');
  const value = input.value.trim();
  if (!value && !textPromptAllowsEmpty) {
    input.focus();
    return;
  }
  closeTextPrompt(value);
}

function localizeError(error) {
  if (state.language !== 'en') return error?.message || t('error.generic');
  const messages = {
    APP_ERROR: 'The operation could not be completed.', UNEXPECTED_ERROR: t('error.generic'), THEME_INVALID: 'Invalid theme setting.', LANGUAGE_INVALID: 'Invalid language setting.',
    SECURE_STORAGE_UNAVAILABLE: 'Windows secure storage is unavailable, so character authorization cannot be saved safely.', TOKEN_DECRYPT_FAILED: 'This character authorization cannot be decrypted. Remove and bind the character again.', CHARACTER_NOT_FOUND: 'Character authorization was not found.',
    OAUTH_CALLBACK_INVALID: 'The authorization callback could not be verified. Bind the character again.', CALLBACK_SERVER_FAILED: 'The local authorization callback could not be started. Check whether port 17890 is in use.', OAUTH_TIMEOUT: 'EVE authorization timed out. Please try again.', OAUTH_IN_PROGRESS: 'Another character authorization is already in progress.',
    CLIENT_ID_REQUIRED: 'Configure an EVE application Client ID first.', REFRESH_TOKEN_MISSING: 'EVE did not return a long-term authorization token. Bind the character again.', CHARACTER_MISMATCH: 'The refreshed authorization belongs to a different character.',
    ROUTE_REQUIRED: 'Plan or load a valid route first.', ROUTE_TOO_LONG: 'Jump-by-jump mode supports up to 250 jumps. Shorten the route or write planned stops only.', NO_CHARACTERS: 'Bind at least one character first.', NO_SELECTED_CHARACTERS: 'Select at least one navigation character.', UNTRUSTED_RENDERER: 'A request outside the MOWAY main interface was rejected.',
    SSO_METADATA_FAILED: 'Could not load the EVE SSO configuration.', SSO_METADATA_INVALID: 'The EVE SSO configuration is incomplete.', SSO_JWKS_FAILED: 'Could not load the EVE SSO signing keys.', SSO_TOKEN_FAILED: 'EVE SSO rejected the authorization.',
    JWT_INVALID: 'EVE returned an invalid access token.', JWT_ALGORITHM_INVALID: 'The EVE access token uses an unsupported signing method.', JWT_KEY_NOT_FOUND: 'The signing key for the EVE access token was not found.', JWT_SIGNATURE_INVALID: 'The EVE access token signature is invalid.', JWT_ISSUER_INVALID: 'The EVE access token issuer is not trusted.', JWT_EXPIRED: 'The EVE access token has expired.', JWT_AUDIENCE_INVALID: 'The EVE access token was not issued to this application.', JWT_SCOPES_MISSING: 'Required ESI scopes are missing. Bind the character again.', JWT_SUBJECT_INVALID: 'The EVE access token does not contain a valid character.',
    ESI_NETWORK_FAILED: 'Could not connect to EVE ESI. Check your network and try again.', ESI_AUTH_FAILED: 'EVE ESI rejected the authorization. Reauthorize the character.', ESI_REQUEST_FAILED: 'The EVE ESI request failed.',
    SYSTEM_NAME_REQUIRED: 'Enter at least one solar system name.', SYSTEM_NOT_FOUND: 'A solar system could not be found.', LOCATION_INVALID: 'A route stop is invalid. Select it again.', LOCATION_TYPE_INVALID: 'A route stop type is invalid. Select it again.', LOCATION_REQUIRED: 'Enter at least one route stop.', LOCATION_NOT_FOUND: 'A route stop could not be found.',
    ROUTE_EMPTY: 'ESI did not return a valid route.', OPTIMIZATION_TOO_LARGE: 'Exact ordering supports at most 15 route stops. Remove stops or turn optimization off.', OPTIMIZATION_LEG_MISSING: 'Route data required for optimization is missing.', ROUTE_STOPS_REQUIRED: 'A route needs a start and a destination.', ROUTE_PREFERENCE_INVALID: 'Invalid route preference.', ROUTE_PENALTY_INVALID: 'Security weighting must be between 0 and 100.', WAYPOINTS_EMPTY: 'The route contains no waypoints that can be written.',
    ROUTE_NOT_FOUND: 'The saved route was not found.', ROUTE_FOLDER_NOT_FOUND: 'The route folder was not found.', CHARACTER_FOLDER_NOT_FOUND: 'The character folder was not found.', ROUTE_IMPORT_INVALID: 'This is not a valid MOWAY route library file.', ROUTE_IMPORT_VERSION: 'This route library version is not supported.', ROUTE_IMPORT_TOO_LARGE: 'The route library file is invalid or larger than 10 MB.',
  };
  return messages[error?.code] || t('error.generic');
}

function translateStaticUi() {
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel)); });
}

function applyLanguage(language, rerender = true) {
  const normalized = language === 'en' ? 'en' : 'zh-CN';
  const changed = state.language !== normalized;
  state.language = normalized;
  if (changed && rerender) document.querySelector('#toastRegion')?.replaceChildren();
  document.documentElement.lang = state.language;
  translateStaticUi();
  const button = document.querySelector('#languageToggle');
  if (button) {
    button.textContent = state.language === 'en' ? '中文' : 'EN';
    button.title = t('language.switch');
  }
  showView(state.view);
  applyTheme(document.documentElement.dataset.theme);
  if (rerender && state.app) renderAll();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return t('date.never');
  return new Intl.DateTimeFormat(state.language === 'en' ? 'en' : 'zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function toast(message, type = 'info', duration = 4200) {
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  document.querySelector('#toastRegion').append(element);
  setTimeout(() => element.remove(), duration);
}

async function busy(button, label, task) {
  if (!button?.classList) throw new Error(t('error.buttonNotReady'));
  const original = button.innerHTML;
  button.disabled = true;
  button.classList.add('loading');
  button.textContent = label;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
    button.innerHTML = original;
  }
}

function showView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === `view-${view}`);
  });
  document.querySelector('#viewEyebrow').textContent = viewLabels[view][0];
  document.querySelector('#viewTitle').textContent = t(viewLabels[view][1]);
}

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = normalized;
  const button = document.querySelector('#themeToggle');
  if (button) {
    button.textContent = t(normalized === 'light' ? 'theme.toDark' : 'theme.toLight');
    button.title = t('theme.title');
  }
}

const locationTypeKeys = {
  solar_system: 'location.solar_system',
  station: 'location.station',
  structure: 'location.structure',
};

function locationTypeLabel(type) {
  return locationTypeKeys[type] ? t(locationTypeKeys[type]) : type;
}

const suggestionTimers = new Map();
let suggestionSequence = 0;

function hideSuggestions(except = null) {
  document.querySelectorAll('.suggestions').forEach((element) => {
    if (element !== except) element.remove();
  });
}

function showSuggestionMessage(field, message) {
  hideSuggestions();
  const menu = document.createElement('div');
  menu.className = 'suggestions';
  menu.innerHTML = `<div class="suggestion-message">${escapeHtml(message)}</div>`;
  field.append(menu);
}

function invalidatePlannedRoute() {
  if (!state.plannedRoute) return;
  state.plannedRoute = null;
  renderPreview();
}

function showSuggestions(field, index, suggestions) {
  hideSuggestions();
  const menu = document.createElement('div');
  menu.className = 'suggestions';
  if (!suggestions.length) {
    menu.innerHTML = `<div class="suggestion-message">${escapeHtml(t('suggestion.none'))}</div>`;
  } else {
    menu.innerHTML = suggestions.map((location, suggestionIndex) => `
      <button type="button" class="suggestion" data-suggestion-index="${suggestionIndex}">
        <span><strong>${escapeHtml(location.name)}</strong><small>ID ${location.destinationId}</small></span>
        <em class="location-type ${location.type}">${escapeHtml(locationTypeLabel(location.type))}</em>
      </button>`).join('');
    menu.querySelectorAll('.suggestion').forEach((button) => button.addEventListener('click', () => {
      const location = suggestions[Number(button.dataset.suggestionIndex)];
      state.draftStops[index] = { text: location.name, resolved: location };
      invalidatePlannedRoute();
      renderStops();
    }));
  }
  field.append(menu);
}

function scheduleSuggestions(index, field, query) {
  clearTimeout(suggestionTimers.get(index));
  if (query.trim().length < 3) {
    hideSuggestions();
    return;
  }
  if (!state.app?.characters?.length) {
    showSuggestionMessage(field, t('suggestion.bindFirst'));
    return;
  }
  const sequence = ++suggestionSequence;
  suggestionTimers.set(index, setTimeout(async () => {
    showSuggestionMessage(field, t('suggestion.searching'));
    try {
      const suggestions = await api.searchLocations(query);
      const current = state.draftStops[index];
      if (sequence !== suggestionSequence || current?.text !== query || !field.isConnected) return;
      showSuggestions(field, index, suggestions);
    } catch (error) {
      if (sequence !== suggestionSequence || !field.isConnected) return;
      showSuggestionMessage(field, localizeError(error));
    }
  }, 320));
}

function renderStops() {
  const list = document.querySelector('#stopList');
  list.innerHTML = state.draftStops.map((stop, index) => {
    const isFirst = index === 0;
    const isLast = index === state.draftStops.length - 1;
    const baseLabel = isFirst ? t('stop.start') : isLast ? t('stop.end') : t('stop.via', { index });
    const label = stop.resolved ? `${baseLabel} · ${locationTypeLabel(stop.resolved.type)}` : baseLabel;
    const marker = isFirst ? 'A' : isLast ? 'B' : String(index);
    const draggable = !isFirst && !isLast;
    return `<div class="stop-row" data-stop-index="${index}">
      <span class="stop-marker ${draggable ? 'draggable-stop' : ''}" ${draggable ? `draggable="true" title="${escapeHtml(t('stop.drag'))}"` : ''}>${marker}</span>
      <div class="stop-field"><label>${escapeHtml(label)}</label><input value="${escapeHtml(stop.text)}" placeholder="${escapeHtml(t('stop.placeholder'))}" spellcheck="false" autocomplete="off"></div>
      ${!isFirst && !isLast ? `<button class="remove-stop" title="${escapeHtml(t('stop.delete'))}">×</button>` : '<span></span>'}
    </div>`;
  }).join('');

  list.querySelectorAll('.stop-row').forEach((row) => {
    const index = Number(row.dataset.stopIndex);
    const field = row.querySelector('.stop-field');
    row.querySelector('input').addEventListener('input', (event) => {
      state.draftStops[index] = { text: event.target.value, resolved: null };
      invalidatePlannedRoute();
      scheduleSuggestions(index, field, event.target.value);
    });
    row.querySelector('input').addEventListener('focus', (event) => {
      if (!state.draftStops[index].resolved) scheduleSuggestions(index, field, event.target.value);
    });
    row.querySelector('.remove-stop')?.addEventListener('click', () => {
      state.draftStops.splice(index, 1);
      invalidatePlannedRoute();
      renderStops();
    });
    const dragHandle = row.querySelector('.draggable-stop');
    dragHandle?.addEventListener('dragstart', (event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `moway-stop:${index}`);
      row.classList.add('stop-dragging');
      hideSuggestions();
    });
    dragHandle?.addEventListener('dragend', () => {
      list.querySelectorAll('.stop-dragging, .stop-drop-before, .stop-drop-after').forEach((element) => {
        element.classList.remove('stop-dragging', 'stop-drop-before', 'stop-drop-after');
      });
    });
    if (index > 0) {
      row.addEventListener('dragover', (event) => {
        if (!Array.from(event.dataTransfer.types).includes('text/plain')) return;
        event.preventDefault();
        const isDestination = index === state.draftStops.length - 1;
        const after = !isDestination && event.clientY > row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2;
        row.classList.toggle('stop-drop-before', !after);
        row.classList.toggle('stop-drop-after', after);
      });
      row.addEventListener('dragleave', () => row.classList.remove('stop-drop-before', 'stop-drop-after'));
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        const match = event.dataTransfer.getData('text/plain').match(/^moway-stop:(\d+)$/);
        if (!match) return;
        const fromIndex = Number(match[1]);
        if (fromIndex <= 0 || fromIndex >= state.draftStops.length - 1) return;
        const after = row.classList.contains('stop-drop-after');
        let insertionIndex = index + (after ? 1 : 0);
        const [moved] = state.draftStops.splice(fromIndex, 1);
        if (fromIndex < insertionIndex) insertionIndex -= 1;
        insertionIndex = Math.max(1, Math.min(insertionIndex, state.draftStops.length - 1));
        state.draftStops.splice(insertionIndex, 0, moved);
        invalidatePlannedRoute();
        renderStops();
      });
    }
  });
}

function previewLines(route) {
  const stopIds = new Set(route.stops.map((stop) => Number(stop.systemId ?? stop.id)));
  const systems = route.expandedRoute;
  if (systems.length <= 18) return systems.map((system, index) => renderRouteLine(system, index, stopIds)).join('');
  const head = systems.slice(0, 9).map((system, index) => renderRouteLine(system, index, stopIds)).join('');
  const tailStart = systems.length - 8;
  const tail = systems.slice(tailStart).map((system, index) => renderRouteLine(system, tailStart + index, stopIds)).join('');
  return `${head}<div class="collapsed-line">${escapeHtml(t('route.hiddenSystems', { count: systems.length - 17 }))}</div>${tail}`;
}

function renderRouteLine(system, index, stopIds) {
  const major = stopIds.has(Number(system.id));
  return `<div class="route-line ${major ? 'major' : ''}">
    <span class="route-dot"></span><strong>${escapeHtml(system.name)}</strong><em>${escapeHtml(major ? t('route.plannedStop') : t('route.jumpIndex', { index }))}</em>
  </div>`;
}

function renderPreview() {
  const preview = document.querySelector('#routePreview');
  const route = state.plannedRoute;
  if (!route) {
    preview.className = 'panel route-preview empty';
    preview.innerHTML = `<div class="empty-state"><div class="orbit-icon"><i></i><i></i><i></i></div><h2>${escapeHtml(t('preview.waiting'))}</h2><p>${escapeHtml(t('preview.waitingNote'))}</p></div>`;
    return;
  }
  const preferenceLabel = { Shorter: t('preference.shorterShort'), Safer: t('preference.saferShort'), LessSecure: t('preference.lessSecureShort') }[route.preference];
  const optimizationSummary = route.optimizeOrder ? `
    <div class="optimized-summary">
      <span>${escapeHtml(t('route.optimized', { destination: route.fixedDestination ? t('optimizer.fixedDestination') : t('optimizer.destinationSorted'), count: route.optimizationSavedJumps || 0 }))}</span>
      <div class="optimized-order">${route.stops.map((stop, index) => `${index ? '<i>→</i>' : ''}<strong>${escapeHtml(stop.name)}</strong>`).join('')}</div>
    </div>` : '';
  preview.className = 'panel route-preview';
  preview.innerHTML = `
    <div class="preview-header"><p class="kicker">CALCULATED ROUTE</p><h2>${escapeHtml(route.stops[0].name)} → ${escapeHtml(route.stops.at(-1).name)}</h2>
      <div class="route-stats"><div class="route-stat"><strong>${route.jumps}</strong><small>${escapeHtml(t('route.totalJumps'))}</small></div><div class="route-stat"><strong>${route.stops.length - 1}</strong><small>${escapeHtml(t('route.legs'))}</small></div><div class="route-stat"><strong>${escapeHtml(preferenceLabel)}</strong><small>${escapeHtml(t('route.preference'))}</small></div></div>
      ${optimizationSummary}
    </div>
    <div class="preview-body">${previewLines(route)}</div>
    <div class="preview-actions">
      <div class="mode-select"><button class="mode-option ${state.applyMode === 'stops' ? 'active' : ''}" data-mode="stops">${escapeHtml(t('route.modeStops'))}</button><button class="mode-option ${state.applyMode === 'exact' ? 'active' : ''}" data-mode="exact">${escapeHtml(t('route.modeExact'))}</button></div>
      <div class="action-row"><button class="primary-button" id="applyRoute">${escapeHtml(t('route.apply'))}</button><button class="secondary-button" id="openSaveModal">${escapeHtml(t('route.save'))}</button></div>
      <p class="apply-hint">${escapeHtml(t('route.applyHint', { count: route.exactDestinationIds?.length ?? route.jumps }))}</p>
    </div>`;
  preview.querySelectorAll('.mode-option').forEach((button) => button.addEventListener('click', () => {
    state.applyMode = button.dataset.mode;
    renderPreview();
  }));
  preview.querySelector('#openSaveModal').addEventListener('click', openSaveModal);
  preview.querySelector('#applyRoute').addEventListener('click', () => applyCurrentRoute());
}

function renderSavedRoutes() {
  const container = document.querySelector('#savedRoutes');
  const routes = (state.app?.savedRoutes || []).slice();
  const folders = (state.app?.routeFolders || []).slice().sort((left, right) => left.sortOrder - right.sortOrder);
  document.querySelector('#savedCount').textContent = routes.length;
  if (!routes.length && !folders.length) {
    container.innerHTML = `<div class="blank-card">${escapeHtml(t('saved.empty'))}</div>`;
    return;
  }

  const groups = [{ id: null, name: t('saved.unfiled'), system: true }, ...folders];
  const routeCard = (route) => `
    <article class="saved-card" data-route-id="${escapeHtml(route.id)}">
      <div class="saved-card-top">
        <button class="drag-handle" draggable="true" title="${escapeHtml(t('route.drag'))}" aria-label="${escapeHtml(t('route.drag'))}">⋮⋮</button>
        <div class="saved-card-title"><h3>${escapeHtml(route.name)}</h3><p>${escapeHtml(t('route.savedSummary', { jumps: route.jumps, legs: route.stops.length - 1, optimized: route.optimizeOrder ? t('route.savedOptimized', { count: route.optimizationSavedJumps || 0 }) : '', date: formatDate(route.updatedAt) }))}</p></div>
        <div class="saved-card-tools"><button class="text-icon-button rename-route" title="${escapeHtml(t('route.rename'))}">✎</button><button class="danger-button delete-route" title="${escapeHtml(t('route.delete'))}">×</button></div>
      </div>
      <div class="route-mini"><span></span><strong>${escapeHtml(route.stops[0].name)}</strong><i></i><strong>${escapeHtml(route.stops.at(-1).name)}</strong><span></span></div>
      <div class="card-actions"><button class="secondary-button load-route">${escapeHtml(t('route.load'))}</button><button class="primary-button apply-saved">${escapeHtml(t('route.applySelected'))}</button></div>
    </article>`;

  container.innerHTML = groups.map((folder) => {
    const folderRoutes = routes
      .filter((route) => (route.folderId || null) === folder.id)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const folderControls = folder.system ? '' : `
      <div class="folder-tools"><button class="text-icon-button rename-folder" title="${escapeHtml(t('common.rename'))}">✎</button><button class="danger-button delete-folder" title="${escapeHtml(t('route.delete'))}">×</button></div>`;
    return `<section class="route-folder" data-folder-id="${escapeHtml(folder.id || '')}">
      <header class="route-folder-header"><div><span class="folder-symbol">◇</span><h3>${escapeHtml(folder.name)}</h3><small>${escapeHtml(t(folderRoutes.length === 1 ? 'saved.folderCountOne' : 'saved.folderCount', { count: folderRoutes.length }))}</small></div>${folderControls}</header>
      <div class="route-folder-dropzone ${folderRoutes.length ? '' : 'empty'}" data-folder-id="${escapeHtml(folder.id || '')}">
        ${folderRoutes.length ? folderRoutes.map(routeCard).join('') : `<div class="folder-empty">${escapeHtml(t('saved.folderEmpty'))}</div>`}
      </div>
    </section>`;
  }).join('');

  const moveRoute = async (routeId, folderId, beforeRouteId = null) => {
    try {
      state.app = await api.moveRoute(routeId, folderId || null, beforeRouteId);
      renderSavedRoutes();
    } catch (error) { toast(localizeError(error), 'error'); }
  };

  container.querySelectorAll('.saved-card').forEach((card) => {
    const route = routes.find((item) => item.id === card.dataset.routeId);
    const dragHandle = card.querySelector('.drag-handle');
    dragHandle.addEventListener('dragstart', (event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', route.id);
      card.classList.add('dragging');
    });
    dragHandle.addEventListener('dragend', () => {
      container.querySelectorAll('.dragging, .drop-before, .drag-over').forEach((element) => {
        element.classList.remove('dragging', 'drop-before', 'drag-over');
      });
    });
    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.add('drop-before');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drop-before'));
    card.addEventListener('drop', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.remove('drop-before');
      const draggedRouteId = event.dataTransfer.getData('text/plain');
      if (!draggedRouteId || draggedRouteId === route.id) return;
      await moveRoute(draggedRouteId, card.closest('.route-folder').dataset.folderId || null, route.id);
    });
    card.querySelector('.load-route').addEventListener('click', () => loadRoute(route));
    card.querySelector('.apply-saved').addEventListener('click', async (event) => {
      state.plannedRoute = structuredClone(route);
      await applyCurrentRoute(event.currentTarget);
    });
    card.querySelector('.rename-route').addEventListener('click', async () => {
      const name = await requestText({
        title: t('route.rename'),
        label: t('route.renamePrompt'),
        value: route.name,
        confirmLabel: t('common.rename'),
        maximumLength: 120,
      });
      if (name === null || !name.trim() || name.trim() === route.name) return;
      try {
        state.app = await api.renameRoute(route.id, name);
        renderSavedRoutes();
        toast(t('route.renamed'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
    card.querySelector('.delete-route').addEventListener('click', async () => {
      if (!window.confirm(t('route.deleteConfirm', { name: route.name }))) return;
      try {
        state.app = await api.deleteRoute(route.id);
        renderAll();
        toast(t('route.deleted'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
  });

  container.querySelectorAll('.route-folder-dropzone').forEach((dropzone) => {
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', (event) => {
      if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', async (event) => {
      event.preventDefault();
      dropzone.classList.remove('drag-over');
      const draggedRouteId = event.dataTransfer.getData('text/plain');
      if (!draggedRouteId) return;
      await moveRoute(draggedRouteId, dropzone.dataset.folderId || null);
    });
  });

  container.querySelectorAll('.route-folder').forEach((section) => {
    const folder = folders.find((item) => item.id === section.dataset.folderId);
    if (!folder) return;
    section.querySelector('.rename-folder').addEventListener('click', async () => {
      const name = await requestText({
        title: t('saved.folderRenamePrompt'),
        label: t('saved.folderNamePrompt'),
        value: folder.name,
        confirmLabel: t('common.rename'),
        maximumLength: 80,
      });
      if (name === null || !name.trim() || name.trim() === folder.name) return;
      try {
        state.app = await api.renameRouteFolder(folder.id, name);
        renderSavedRoutes();
        toast(t('saved.folderRenamed'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
    section.querySelector('.delete-folder').addEventListener('click', async () => {
      if (!window.confirm(t('saved.folderDeleteConfirm', { name: folder.name }))) return;
      try {
        state.app = await api.deleteRouteFolder(folder.id);
        renderSavedRoutes();
        toast(t('saved.folderDeleted'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
  });
}

function characterStatus(character) {
  if (character.authState === 'reauthorize') return [t('pilot.authExpired'), 'error'];
  if (character.authState === 'error') return [t('pilot.checkFailed'), 'error'];
  if (character.lastOnline === true) return [t('pilot.online'), 'online'];
  if (character.lastOnline === false) return [t('pilot.offline'), 'offline'];
  return [t('pilot.unknown'), 'offline'];
}

function renderPilots() {
  const characters = (state.app?.characters || []).slice();
  const folders = (state.app?.characterFolders || []).slice().sort((left, right) => left.sortOrder - right.sortOrder);
  const selectedCharacters = characters.filter((character) => character.navigationEnabled !== false);
  document.querySelector('#pilotCount').textContent = `${selectedCharacters.length}/${characters.length}`;
  const shortcut = document.querySelector('#pilotShortcut');
  shortcut.innerHTML = selectedCharacters.slice(0, 3).map((character) => `<img alt="${escapeHtml(character.name)}" src="https://images.evetech.net/characters/${character.characterId}/portrait?size=64">`).join('') || '<span class="avatar-fallback">＋</span>';
  const container = document.querySelector('#pilotList');
  if (!characters.length && !folders.length) {
    container.innerHTML = `<div class="blank-card">${escapeHtml(t('pilot.empty'))}</div>`;
    return;
  }

  const groups = [{ id: null, name: t('pilots.unfiled'), system: true }, ...folders];
  const characterCard = (character) => {
    const [label, klass] = characterStatus(character);
    const checked = character.navigationEnabled !== false ? 'checked' : '';
    return `<article class="pilot-card" data-character-id="${character.characterId}">
      <button class="drag-handle character-drag-handle" draggable="true" title="${escapeHtml(t('pilot.drag'))}" aria-label="${escapeHtml(t('pilot.drag'))}">⋮⋮</button>
      <img alt="${escapeHtml(character.name)}" src="https://images.evetech.net/characters/${character.characterId}/portrait?size=128">
      <div class="pilot-copy"><h3>${escapeHtml(character.name)}</h3><p class="pilot-note ${character.note ? '' : 'empty'}">${escapeHtml(character.note ? `${t('pilot.note')}: ${character.note}` : t('pilot.noNote'))}</p><div class="pilot-meta"><span><i class="status-dot ${klass}"></i>${escapeHtml(label)}</span><span>${escapeHtml(t('pilot.characterId', { id: character.characterId }))}</span><span>${formatDate(character.lastCheckedAt)}</span></div></div>
      <div class="pilot-actions">
        <button class="text-icon-button edit-pilot-note" title="${escapeHtml(t('pilot.note'))}" aria-label="${escapeHtml(t('pilot.note'))}">✎</button>
        <label class="pilot-toggle"><input type="checkbox" class="navigation-enabled" ${checked}><span></span><strong>${escapeHtml(t('pilot.navigation'))}</strong></label>
        ${character.authState === 'reauthorize' ? `<button class="secondary-button reauthorize">${escapeHtml(t('pilot.reauthorize'))}</button>` : ''}<button class="danger-button remove-pilot">${escapeHtml(t('pilot.remove'))}</button>
      </div>
    </article>`;
  };

  container.innerHTML = groups.map((folder) => {
    const folderCharacters = characters
      .filter((character) => (character.folderId || null) === folder.id)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const folderControls = folder.system ? '' : `
      <div class="folder-tools"><button class="text-icon-button rename-character-folder" title="${escapeHtml(t('common.rename'))}">✎</button><button class="danger-button delete-character-folder" title="${escapeHtml(t('route.delete'))}">×</button></div>`;
    return `<section class="route-folder character-folder" data-folder-id="${escapeHtml(folder.id || '')}">
      <header class="route-folder-header"><div><span class="folder-symbol">◇</span><h3>${escapeHtml(folder.name)}</h3><small>${escapeHtml(t(folderCharacters.length === 1 ? 'pilots.folderCountOne' : 'pilots.folderCount', { count: folderCharacters.length }))}</small></div>${folderControls}</header>
      <div class="character-folder-dropzone ${folderCharacters.length ? '' : 'empty'}" data-folder-id="${escapeHtml(folder.id || '')}">
        ${folderCharacters.length ? folderCharacters.map(characterCard).join('') : `<div class="folder-empty">${escapeHtml(t('pilots.folderEmpty'))}</div>`}
      </div>
    </section>`;
  }).join('');

  const moveCharacter = async (characterId, folderId, beforeCharacterId = null) => {
    try {
      state.app = await api.moveCharacter(characterId, folderId || null, beforeCharacterId);
      renderPilots();
    } catch (error) { toast(localizeError(error), 'error'); }
  };

  container.querySelectorAll('.pilot-card').forEach((card) => {
    const character = characters.find((item) => item.characterId === card.dataset.characterId);
    const dragHandle = card.querySelector('.character-drag-handle');
    dragHandle.addEventListener('dragstart', (event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-moway-character', character.characterId);
      card.classList.add('dragging');
    });
    dragHandle.addEventListener('dragend', () => {
      container.querySelectorAll('.dragging, .drop-before, .drag-over').forEach((element) => {
        element.classList.remove('dragging', 'drop-before', 'drag-over');
      });
    });
    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.add('drop-before');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drop-before'));
    card.addEventListener('drop', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.remove('drop-before');
      const draggedCharacterId = event.dataTransfer.getData('application/x-moway-character');
      if (!draggedCharacterId || draggedCharacterId === character.characterId) return;
      await moveCharacter(draggedCharacterId, card.closest('.character-folder').dataset.folderId || null, character.characterId);
    });
    card.querySelector('.navigation-enabled').addEventListener('change', async (event) => {
      const enabled = event.target.checked;
      event.target.disabled = true;
      try {
        state.app = await api.setCharacterNavigation(character.characterId, enabled);
        renderPilots();
      } catch (error) {
        event.target.checked = !enabled;
        event.target.disabled = false;
        toast(localizeError(error), 'error');
      }
    });
    card.querySelector('.edit-pilot-note').addEventListener('click', async () => {
      const note = await requestText({
        title: `${t('pilot.note')} · ${character.name}`,
        label: t('pilot.notePrompt'),
        value: character.note || '',
        confirmLabel: t('common.save'),
        maximumLength: 240,
        allowEmpty: true,
      });
      if (note === null || note === (character.note || '')) return;
      try {
        state.app = await api.setCharacterNote(character.characterId, note);
        renderPilots();
        toast(t('pilot.noteUpdated'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
    card.querySelector('.reauthorize')?.addEventListener('click', () => beginAuthorization());
    card.querySelector('.remove-pilot').addEventListener('click', async () => {
      if (!window.confirm(t('pilot.removeConfirm', { name: character.name }))) return;
      try {
        state.app = await api.removeCharacter(character.characterId);
        renderAll();
        toast(t('pilot.removed'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
  });

  container.querySelectorAll('.character-folder-dropzone').forEach((dropzone) => {
    dropzone.addEventListener('dragover', (event) => {
      if (!Array.from(event.dataTransfer.types).includes('application/x-moway-character')) return;
      event.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', (event) => {
      if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', async (event) => {
      event.preventDefault();
      dropzone.classList.remove('drag-over');
      const draggedCharacterId = event.dataTransfer.getData('application/x-moway-character');
      if (!draggedCharacterId) return;
      await moveCharacter(draggedCharacterId, dropzone.dataset.folderId || null);
    });
  });

  container.querySelectorAll('.character-folder').forEach((section) => {
    const folder = folders.find((item) => item.id === section.dataset.folderId);
    if (!folder) return;
    section.querySelector('.rename-character-folder').addEventListener('click', async () => {
      const name = await requestText({
        title: t('pilots.folderRenamePrompt'),
        label: t('pilots.folderNamePrompt'),
        value: folder.name,
        confirmLabel: t('common.rename'),
        maximumLength: 80,
      });
      if (name === null || !name.trim() || name.trim() === folder.name) return;
      try {
        state.app = await api.renameCharacterFolder(folder.id, name);
        renderPilots();
        toast(t('pilots.folderRenamed'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
    section.querySelector('.delete-character-folder').addEventListener('click', async () => {
      if (!window.confirm(t('pilots.folderDeleteConfirm', { name: folder.name }))) return;
      try {
        state.app = await api.deleteCharacterFolder(folder.id);
        renderPilots();
        toast(t('pilots.folderDeleted'), 'success');
      } catch (error) { toast(localizeError(error), 'error'); }
    });
  });
}

function renderSettings() {
  const settings = state.app?.settings;
  if (!settings) return;
  document.querySelector('#clientId').value = settings.clientId || '';
  document.querySelector('#contact').value = settings.contact || '';
  document.querySelector('#callbackUrl').value = settings.callbackUrl || '';
  document.querySelector('#storageLocation').textContent = state.app.security?.storageLocation || '—';
  const encryption = state.app.security?.tokenEncryptionAvailable;
  document.querySelector('.sidebar-security strong').textContent = encryption ? t('security.localEncrypted') : t('security.unavailable');
  document.querySelector('.sidebar-security small').textContent = encryption ? t('security.windowsProtected') : t('security.bindingDisabled');
  applyTheme(settings.theme);
}

function renderOptimizationControls() {
  const optimizeInput = document.querySelector('#optimizeOrder');
  const fixedInput = document.querySelector('#fixedDestination');
  const fixedRow = document.querySelector('#fixedDestinationRow');
  optimizeInput.checked = state.optimizeOrder;
  fixedInput.checked = state.fixedDestination;
  fixedInput.disabled = !state.optimizeOrder;
  fixedRow.classList.toggle('disabled', !state.optimizeOrder);
}

function renderAll() {
  renderStops();
  renderPreview();
  renderSavedRoutes();
  renderPilots();
  renderSettings();
  renderOptimizationControls();
}

function loadRoute(route) {
  state.plannedRoute = structuredClone(route);
  state.draftStops = route.stops.map((stop) => ({
    text: stop.name,
    resolved: {
      ...stop,
      destinationId: Number(stop.destinationId ?? stop.id),
      systemId: Number(stop.systemId ?? stop.id),
      type: stop.type || 'solar_system',
    },
  }));
  state.preference = route.preference;
  state.securityPenalty = route.securityPenalty;
  state.optimizeOrder = Boolean(route.optimizeOrder);
  state.fixedDestination = route.fixedDestination !== false;
  document.querySelector('#securityPenalty').value = route.securityPenalty;
  document.querySelector('#penaltyValue').textContent = route.securityPenalty;
  document.querySelectorAll('.preference-card').forEach((button) => button.classList.toggle('active', button.dataset.preference === route.preference));
  document.querySelector('#penaltyRow').classList.toggle('disabled', route.preference === 'Shorter');
  renderOptimizationControls();
  showView('planner');
  renderStops();
  renderPreview();
  toast(t('route.loaded'), 'success');
}

async function planCurrentRoute() {
  const button = document.querySelector('#planRoute');
  try {
    const route = await busy(button, t('route.calculating'), () => api.planRoute({
      stops: state.draftStops.map((stop) => stop.resolved || { name: stop.text }),
      preference: state.preference,
      securityPenalty: state.securityPenalty,
      optimizeOrder: state.optimizeOrder,
      fixedDestination: state.fixedDestination,
    }));
    state.plannedRoute = route;
    renderPreview();
    const optimizedMessage = route.optimizeOrder ? t('route.optimizedSaved', { count: route.optimizationSavedJumps || 0 }) : '';
    toast(t('route.calculated', { jumps: route.jumps, optimized: optimizedMessage }), 'success');
  } catch (error) { toast(localizeError(error), 'error', 6500); }
}

async function applyCurrentRoute(buttonOverride = null) {
  const button = buttonOverride?.classList ? buttonOverride : document.querySelector('#applyRoute');
  if (!state.plannedRoute) return;
  if (state.applyMode === 'exact' && state.plannedRoute.jumps > 30) {
    const selectedCount = state.app.characters.filter((character) => character.navigationEnabled !== false).length;
    const estimated = (state.plannedRoute.exactDestinationIds?.length ?? state.plannedRoute.jumps) * Math.max(1, selectedCount);
    if (!window.confirm(t('route.writeConfirm', { count: estimated }))) return;
  }
  try {
    const result = await busy(button, t('route.writing'), () => api.applyRoute(state.plannedRoute, state.applyMode));
    state.app = result.state;
    renderPilots();
    const success = result.results.filter((item) => item.status === 'success');
    const offline = result.results.filter((item) => item.status === 'offline');
    const failed = result.results.filter((item) => item.status === 'failed');
    if (success.length) toast(t('route.applySuccess', { success: success.length, offline: offline.length }), failed.length ? 'info' : 'success', 6500);
    else if (failed.length) toast(failed.map((item) => `${item.name}: ${localizeError(item)}`).join('; '), 'error', 8000);
    else toast(t('route.noneOnline', { count: offline.length }), 'info');
    if (failed.length && success.length) toast(t('route.applyFailed', { count: failed.length, names: failed.map((item) => item.name).join(state.language === 'en' ? ', ' : '、') }), 'error', 7000);
  } catch (error) { toast(localizeError(error), 'error', 7000); }
}

function openSaveModal() {
  if (!state.plannedRoute) return;
  document.querySelector('#routeName').value = state.plannedRoute.name;
  const folderSelect = document.querySelector('#routeFolder');
  const folders = (state.app?.routeFolders || []).slice().sort((left, right) => left.sortOrder - right.sortOrder);
  folderSelect.innerHTML = [
    `<option value="">${escapeHtml(t('saved.unfiled'))}</option>`,
    ...folders.map((folder) => `<option value="${escapeHtml(folder.id)}">${escapeHtml(folder.name)}</option>`),
  ].join('');
  folderSelect.value = state.plannedRoute.folderId || '';
  document.querySelector('#saveModal').classList.remove('hidden');
  document.querySelector('#routeName').focus();
}

function closeSaveModal() {
  document.querySelector('#saveModal').classList.add('hidden');
}

async function confirmSave() {
  const button = document.querySelector('#confirmSave');
  try {
    const saved = await busy(button, t('route.saving'), () => api.saveRoute({
      ...state.plannedRoute,
      name: document.querySelector('#routeName').value.trim(),
      folderId: document.querySelector('#routeFolder').value || null,
    }));
    state.plannedRoute = saved;
    state.app = await api.getState();
    closeSaveModal();
    renderAll();
    toast(t('route.saved'), 'success');
  } catch (error) { toast(localizeError(error), 'error'); }
}

async function saveSettings() {
  const button = document.querySelector('#saveSettings');
  try {
    state.app = await busy(button, t('settings.saving'), () => api.saveSettings({
      clientId: document.querySelector('#clientId').value,
      contact: document.querySelector('#contact').value,
    }));
    renderAll();
    toast(t('settings.saved'), 'success');
  } catch (error) { toast(localizeError(error), 'error'); }
}

async function beginAuthorization(buttonOverride = null) {
  const button = buttonOverride || document.querySelector('#bindPilot');
  if (!state.app.settings.clientId) {
    showView('settings');
    toast(t('settings.clientIdFirst'), 'error');
    return;
  }
  try {
    state.app = await busy(button, t('pilot.waitingAuth'), () => api.beginAuthorization());
    renderAll();
    toast(t('pilot.bound'), 'success');
  } catch (error) { toast(localizeError(error), 'error', 7500); }
}

async function refreshPilots() {
  const button = document.querySelector('#refreshPilots');
  try {
    state.app = await busy(button, t('pilot.checking'), () => api.refreshCharacters());
    renderPilots();
    toast(t('pilot.refreshed'), 'success');
  } catch (error) { toast(localizeError(error), 'error'); }
}

async function createRouteFolder() {
  const name = await requestText({
    title: t('saved.createFolder').replace(/^＋\s*/, ''),
    label: t('saved.folderNamePrompt'),
    confirmLabel: t('common.create'),
    maximumLength: 80,
  });
  if (name === null || !name.trim()) return;
  try {
    state.app = await api.createRouteFolder(name);
    renderSavedRoutes();
    toast(t('saved.folderCreated'), 'success');
  } catch (error) { toast(localizeError(error), 'error'); }
}

async function createCharacterFolder() {
  const name = await requestText({
    title: t('pilots.createFolder').replace(/^＋\s*/, ''),
    label: t('pilots.folderNamePrompt'),
    confirmLabel: t('common.create'),
    maximumLength: 80,
  });
  if (name === null || !name.trim()) return;
  try {
    state.app = await api.createCharacterFolder(name);
    renderPilots();
    toast(t('pilots.folderCreated'), 'success');
  } catch (error) { toast(localizeError(error), 'error'); }
}

async function exportSavedRouteLibrary(button) {
  try {
    const result = await busy(button, t('saved.export'), () => api.exportRouteLibrary());
    if (!result.canceled) toast(t('saved.exported', { file: result.fileName }), 'success', 6500);
  } catch (error) { toast(localizeError(error), 'error', 7000); }
}

async function importSavedRouteLibrary(button) {
  try {
    const result = await busy(button, t('saved.import'), () => api.importRouteLibrary());
    if (result.canceled) return;
    state.app = result.state;
    renderAll();
    toast(t('saved.imported', {
      file: result.fileName,
      routes: result.importedRoutes,
      folders: result.importedFolders,
    }), 'success', 7500);
  } catch (error) { toast(localizeError(error), 'error', 7500); }
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
  document.querySelector('#pilotShortcut').addEventListener('click', () => showView('pilots'));
  document.querySelector('#addStop').addEventListener('click', () => {
    state.draftStops.splice(state.draftStops.length - 1, 0, { text: '', resolved: null });
    invalidatePlannedRoute();
    renderStops();
    document.querySelectorAll('.stop-row input')[state.draftStops.length - 2].focus();
  });
  document.querySelector('#swapEndpoints').addEventListener('click', () => {
    const first = state.draftStops[0];
    state.draftStops[0] = state.draftStops.at(-1);
    state.draftStops[state.draftStops.length - 1] = first;
    invalidatePlannedRoute();
    renderStops();
  });
  document.querySelectorAll('.preference-card').forEach((button) => button.addEventListener('click', () => {
    state.preference = button.dataset.preference;
    invalidatePlannedRoute();
    document.querySelectorAll('.preference-card').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelector('#penaltyRow').classList.toggle('disabled', state.preference === 'Shorter');
  }));
  document.querySelector('#securityPenalty').addEventListener('input', (event) => {
    state.securityPenalty = Number(event.target.value);
    invalidatePlannedRoute();
    document.querySelector('#penaltyValue').textContent = event.target.value;
  });
  document.querySelector('#optimizeOrder').addEventListener('change', (event) => {
    state.optimizeOrder = event.target.checked;
    invalidatePlannedRoute();
    renderOptimizationControls();
  });
  document.querySelector('#fixedDestination').addEventListener('change', (event) => {
    state.fixedDestination = event.target.checked;
    invalidatePlannedRoute();
  });
  document.querySelector('#planRoute').addEventListener('click', planCurrentRoute);
  document.querySelector('#bindPilot').addEventListener('click', (event) => beginAuthorization(event.currentTarget));
  document.querySelector('#refreshPilots').addEventListener('click', refreshPilots);
  document.querySelector('#createCharacterFolder').addEventListener('click', createCharacterFolder);
  document.querySelector('#createRouteFolder').addEventListener('click', createRouteFolder);
  document.querySelector('#exportRouteLibrary').addEventListener('click', (event) => exportSavedRouteLibrary(event.currentTarget));
  document.querySelector('#importRouteLibrary').addEventListener('click', (event) => importSavedRouteLibrary(event.currentTarget));
  document.querySelector('#languageToggle').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const previous = state.language;
    const next = previous === 'en' ? 'zh-CN' : 'en';
    button.disabled = true;
    applyLanguage(next);
    try {
      state.app = await api.setLanguage(next);
      applyLanguage(state.app.settings.language);
    } catch (error) {
      applyLanguage(previous);
      toast(localizeError(error), 'error');
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector('#themeToggle').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const previous = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = previous === 'dark' ? 'light' : 'dark';
    button.disabled = true;
    applyTheme(next);
    try {
      state.app = await api.setTheme(next);
      applyTheme(state.app.settings.theme);
    } catch (error) {
      applyTheme(previous);
      toast(localizeError(error), 'error');
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector('#selectAllPilots').addEventListener('click', async (event) => {
    try {
      state.app = await busy(event.currentTarget, t('pilot.selectingAll'), () => api.setAllCharacterNavigation(true));
      renderPilots();
    } catch (error) { toast(localizeError(error), 'error'); }
  });
  document.querySelector('#clearPilots').addEventListener('click', async (event) => {
    try {
      state.app = await busy(event.currentTarget, t('pilot.clearing'), () => api.setAllCharacterNavigation(false));
      renderPilots();
    } catch (error) { toast(localizeError(error), 'error'); }
  });
  document.querySelector('#saveSettings').addEventListener('click', saveSettings);
  document.querySelector('#openDevelopers').addEventListener('click', () => api.openDevelopers());
  document.querySelector('#copyCallback').addEventListener('click', () => {
    api.copyText(document.querySelector('#callbackUrl').value);
    toast(t('settings.callbackCopied'), 'success');
  });
  document.querySelector('#confirmSave').addEventListener('click', confirmSave);
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeSaveModal));
  document.querySelector('#saveModal').addEventListener('click', (event) => {
    if (event.target.id === 'saveModal') closeSaveModal();
  });
  document.querySelector('#confirmTextPrompt').addEventListener('click', submitTextPrompt);
  document.querySelector('#cancelTextPrompt').addEventListener('click', () => closeTextPrompt(null));
  document.querySelector('#textPromptModal').addEventListener('click', (event) => {
    if (event.target.id === 'textPromptModal') closeTextPrompt(null);
  });
  document.querySelector('#textPromptInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitTextPrompt();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeTextPrompt(null);
      closeSaveModal();
      hideSuggestions();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.stop-field')) hideSuggestions();
  });
}

async function initialize() {
  bindEvents();
  document.querySelector('#penaltyRow').classList.add('disabled');
  try {
    state.app = await api.getState();
    applyLanguage(state.app.settings.language, false);
    applyTheme(state.app.settings.theme);
    renderAll();
    if (!state.app.settings.clientId) {
      toast(t('startup.firstUse'), 'info', 7000);
    }
  } catch (error) {
    toast(localizeError(error), 'error', 8000);
  }
}

initialize();
