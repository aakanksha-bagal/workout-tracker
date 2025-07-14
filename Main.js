const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
//const Store = require('electron-store');

//const ElectronStore = require('electron-store').default;
// Remove electron-store imports and add these:
const Activity = require('./Activity');

// Replace your IPC handlers with these:
ipcMain.handle('get-activities', async () => {
  return await Activity.findAll({
    order: [['date', 'DESC']]
  });
});

ipcMain.on('save-activity', async (event, activityData) => {
  await Activity.create(activityData);
});

ipcMain.on('delete-activity', async (event, id) => {
  await Activity.destroy({ where: { id } });
});

const notifier = require('node-notifier');

// Initialize the store
//const store = new Store();
//const store = new ElectronStore();
// Create a global variable to hold the main window
let mainWindow;

// Schedule daily reminder
function scheduleReminder() {
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(17, 0, 0, 0); // 5 PM
  
  // If it's past 5 PM, set for next day
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const timeUntilReminder = reminderTime - now;
  
  setTimeout(() => {
    notifier.notify({
      title: 'Workout Reminder',
      message: 'Time for your daily workout!',
      sound: true,
      wait: true
    });
    
    // Reschedule for next day
    scheduleReminder();
  }, timeUntilReminder);
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open the DevTools (optional)
  // mainWindow.webContents.openDevTools();

  // Set up the application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          click: () => app.quit()
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Start the reminder scheduler
  scheduleReminder();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
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

// IPC handlers for data storage
ipcMain.on('save-activity', (event, activity) => {
  const activities = store.get('activities', []);
  activities.push({
    ...activity,
    // Calculate total distance if not provided
    totalDistance: (activity.walkingDistance || 0) + (activity.runningDistance || 0)
  });
  store.set('activities', activities);
});
// ipc handler to delete activity
ipcMain.on('delete-activity', (event, index) => {
  const activities = store.get('activities', []);
  if (index >= 0 && index < activities.length) {
    activities.splice(index, 1);
    store.set('activities', activities);
  }
});