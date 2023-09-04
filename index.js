const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');
const {
  autoUpdater
} = require('electron-updater');
const {
  startProccess,
  stopProccess
} = require('./bot');

let mainWindow;
let updateCheckInProgress = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 430,
    x: 960,
    y: 300,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffff',
      symbolColor: '#3b71ca'
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  // Menu.setApplicationMenu(null)
  mainWindow.loadFile('ui.html');
  
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update_progress', progress.percent);
  });

  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available', () => {
    updateCheckInProgress = false;
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('start', async (event, headless) => {
  const logs = [];

  const logToTextarea = (message) => {
    logs.push(message);
    event.sender.send('log', logs.join('\n'));
  };

  await startProccess(logToTextarea, headless).catch((error) => logToTextarea(error));
});

ipcMain.on('stop', (event) => {
  const logs = [];

  const logToTextarea = (message) => {
    logs.push(message);
    event.sender.send('log', logs.join('\n'));
  };

  stopProccess(logToTextarea);
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});