const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');
const { autoUpdater } = require('electron-updater');
const {
  startProccess, stopProccess 
} = require('./bot');

let mainWindow;

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
}

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on("update-available", () => {
  console.log('update available');
})

autoUpdater.on("checking-for-update", () => {
  console.log('checking for update');
})

autoUpdater.on("download-progress", () => {
  console.log('download proggress');
})

autoUpdater.on("update-downloaded", () => {
  console.log("update downloaded");
})

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