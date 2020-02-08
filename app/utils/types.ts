export interface Note {
    content: string;
    id: string;
    config: NoteConfig;
}

export interface NoteConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
}

export type FsQueue = {
    [id: string]: {
        content: Promise<void>;
        config: Promise<void>;
    }
}