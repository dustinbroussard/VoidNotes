import { Note } from '../types';

const DB_NAME = 'VoidNotesDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';
const LAST_NOTE_KEY = 'void_notes_last_id';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const storage = {
  getNotes: async (): Promise<Note[]> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          // Sort descending by updated
          const notes = request.result.sort((a: Note, b: Note) => b.updatedAt - a.updatedAt);
          resolve(notes);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to load notes from IndexedDB', e);
      return [];
    }
  },

  saveNote: async (note: Note): Promise<void> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(note);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to save note to IndexedDB', e);
    }
  },

  deleteNote: async (id: string): Promise<void> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  },

  getLastOpenedId: (): string | null => {
    try {
      return localStorage.getItem(LAST_NOTE_KEY);
    } catch (e) {
      console.error('Failed to read last opened note', e);
      return null;
    }
  },

  setLastOpenedId: (id: string | null) => {
    try {
      if (id) {
        localStorage.setItem(LAST_NOTE_KEY, id);
      } else {
        localStorage.removeItem(LAST_NOTE_KEY);
      }
    } catch (e) {
      console.error('Failed to store last opened note', e);
    }
  },

  exportNoteAsTxt: (note: Note) => {
    const safeTitle = (note.title || 'Untitled')
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .trim() || 'Untitled';
    const filename = `${safeTitle}.txt`;
    const blob = new Blob([note.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
