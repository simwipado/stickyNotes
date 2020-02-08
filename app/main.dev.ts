/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './menu';
import { checkRootDir, getNoteDirs, createNote, getNote, saveContent, saveConfig, removeNote } from './utils/fs-api';
import { Note } from './utils/types';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

checkRootDir();
getNoteDirs().then(async (dirs) => {
  if (dirs.length === 0) {
    const note = await createNote();
    openNote(note, true);
  } else {
    for (const dir of dirs) {
      const note = await getNote(dir);
      openNote(note);
    }
  }
});

const appReady = new Promise(resolve => app.on('ready', () => resolve()));

const openNote = (note: Note, newNote = false) => {
  appReady.then(() => {
    const updateRectangle = async () => {
      const rectangle = window.getBounds();
      note.config = {
        ...note.config,
        ...rectangle,
      }

      await saveConfig(note.id, note.config);
    }
    const window = new BrowserWindow({
      width: note.config.width,
      height: note.config.height,
      frame: false,
      x: newNote ? undefined : note.config.x,
      y: newNote ? undefined : note.config.y,
    });

    window.loadURL(`file://${__dirname}/app.html`);
    window.webContents.on('did-finish-load', () => {
      window.webContents.send('note-data', note);
    });

    updateRectangle();
    window.on('resize', updateRectangle);
    window.on('move', updateRectangle)

    ipcMain.on('remove-note', (_, id: string) => {
      if (id === note.id) {
        window.close();
      }
      removeNote(id);
    })
  });
}

appReady.then(async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }
  new AppUpdater();
});

ipcMain.on('create-note', async () => {
  const note = await createNote();
  openNote(note, true);
});

ipcMain.on('update-content', async (_, id: string, content: string) => {
  await saveContent(id, content);
});