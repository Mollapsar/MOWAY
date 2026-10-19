'use strict';

const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');

function trustedRendererUrl(appRoot) {
  return pathToFileURL(path.join(appRoot, 'renderer', 'index.html')).href;
}

function isTrustedRendererEvent(event, mainWindow, appRoot) {
  if (!event || !mainWindow || !event.senderFrame) return false;
  if (event.sender !== mainWindow.webContents) return false;
  if (event.senderFrame.url !== mainWindow.webContents.getURL()) return false;
  try {
    const actualPath = path.resolve(fileURLToPath(event.senderFrame.url));
    const expectedPath = path.resolve(appRoot, 'renderer', 'index.html');
    return process.platform === 'win32'
      ? actualPath.toLocaleLowerCase('en-US') === expectedPath.toLocaleLowerCase('en-US')
      : actualPath === expectedPath;
  } catch {
    return false;
  }
}

module.exports = { isTrustedRendererEvent, trustedRendererUrl };
