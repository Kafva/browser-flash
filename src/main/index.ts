const path = require('path');
import { ipcMain, app, webContents } from 'electron';
import { setIpcMain } from '@wexond/rpc-electron';
setIpcMain(ipcMain);

if (process.env.NODE_ENV === 'development') {
  require('source-map-support').install();
}

import { platform } from 'os';
import { Application } from './application';

export const isNightly = app.name === 'wexond-nightly';

app.allowRendererProcessReuse = true;
app.name = isNightly ? 'Wexond Nightly' : 'Wexond';

(process.env as any)['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

app.commandLine.appendSwitch('--enable-transparent-visuals');
app.commandLine.appendSwitch(
  'enable-features',
  'CSSColorSchemeUARendering, ImpulseScrollAnimations, ParallelDownloading',
);

if (process.env.NODE_ENV === 'development') {
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
}

ipcMain.setMaxListeners(0);

// Flash
let arch = (process.arch === 'ia32') ? '32' : '64';
let pluginName;

switch (process.platform) {
  case 'win32':
    pluginName = `flash/pepflashplayer${arch}_32_0_0_303.dll`;
    break;
  case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin';
    break;
  case 'linux':
    pluginName = 'flash/libpepflashplayer.so';
    break;
}

let flashPath =
  (process.env.NODE_ENV === 'development')
    ? path.join(__dirname, pluginName)
    : path.join(process.resourcesPath, pluginName);

console.log(arch, pluginName, flashPath);
app.commandLine.appendSwitch('ppapi-flash-path', flashPath);

// app.setAsDefaultProtocolClient('http');
// app.setAsDefaultProtocolClient('https');

const application = Application.instance;
application.start();

process.on('uncaughtException', (error) => {
  console.error(error);
});

app.on('window-all-closed', () => {
  if (platform() !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('get-webcontents-id', (e) => {
  e.returnValue = e.sender.id;
});

ipcMain.on('get-window-id', (e) => {
  e.returnValue = (e.sender as any).windowId;
});

ipcMain.handle(
  `web-contents-call`,
  async (e, { webContentsId, method, args = [] }) => {
    const wc = webContents.fromId(webContentsId);
    const result = (wc as any)[method](...args);

    if (result) {
      if (result instanceof Promise) {
        return await result;
      }

      return result;
    }
  },
);
