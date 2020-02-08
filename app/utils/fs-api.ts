import { homedir } from 'os';
import { Note, NoteConfig, FsQueue } from './types';
import { promises, remove } from 'fs-extra';

const homeDir = homedir();
const stickyNotesDir = `${homeDir}/.simwipado/stickyNotes`;

const fsQueue: FsQueue = {};

async function checkRootDir() {
    try {
        await promises.mkdir(stickyNotesDir);
    } catch{ }
    checkRootConfig()
}

async function checkRootConfig() {
    try {
        await promises.access(`${stickyNotesDir}/config.json`);
    } catch {

    }
}

async function getNoteDirs() {
    const dirents = await promises.readdir(`${stickyNotesDir}`, { withFileTypes: true });
    return dirents
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

async function getNote(id: string) {
    const dir = `${stickyNotesDir}/${id}`
    const content = await promises.readFile(`${dir}/content`, { encoding: 'utf8' }) as string;
    const configString = await promises.readFile(`${dir}/config.json`, { encoding: 'utf8' }) as string;
    const config: NoteConfig = JSON.parse(configString);

    const note: Note = {
        id,
        config,
        content: content,
    };

    return note;
}

function getDefaultNoteConfig() {
    return `
{
    "name": "Note",
    "height": 300,
    "width": 300,
    "x": 0,
    "y": 0
}
    `;
}

async function createNote() {
    let id = 1;
    const notes = await getNoteDirs();
    while (notes.includes(id + '')) {
        ++id;
    }

    await promises.mkdir(`${stickyNotesDir}/${id}`);
    await promises.writeFile(`${stickyNotesDir}/${id}/content`, '');
    const configString = getDefaultNoteConfig();
    const config = JSON.parse(configString);
    await promises.writeFile(`${stickyNotesDir}/${id}/config.json`, configString);

    const note: Note = {
        id: id + '',
        content: '',
        config,
    }

    return note;
}

async function saveContent(id: string, content: string) {
    if (!fsQueue[id]) {
        fsQueue[id] = {
            config: new Promise(r => r()),
            content: new Promise(r => r()),
        }
    }

    fsQueue[id].content = new Promise(r => {
        fsQueue[id].content.then(() => {
            r();
            promises.writeFile(`${stickyNotesDir}/${id}/content`, content);
        })
    });
}

async function saveConfig(id: string, config: NoteConfig) {
    if (!fsQueue[id]) {
        fsQueue[id] = {
            config: new Promise(r => r()),
            content: new Promise(r => r()),
        }
    }

    fsQueue[id].config = new Promise(r => {
        fsQueue[id].config.then(() => {
            r();
            promises.writeFile(`${stickyNotesDir}/${id}/config.json`, JSON.stringify(config));
        })
    });
}

function removeNote(id: string) {
    remove(`${stickyNotesDir}/${id}`);
}

export {
    checkRootDir,
    getNoteDirs,
    createNote,
    getNote,
    saveContent,
    saveConfig,
    removeNote,
};