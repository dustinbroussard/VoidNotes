import { Note } from '../types';

const STORAGE_KEY = 'void_notes_data';
const LAST_NOTE_KEY = 'void_notes_last_id';

export const storage = {
  getNotes: (): Note[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load notes from local storage', e);
      return [];
    }
  },

  saveNotes: (notes: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to local storage', e);
    }
  },

  getLastOpenedId: (): string | null => {
    return localStorage.getItem(LAST_NOTE_KEY);
  },

  setLastOpenedId: (id: string | null) => {
    if (id) {
      localStorage.setItem(LAST_NOTE_KEY, id);
    } else {
      localStorage.removeItem(LAST_NOTE_KEY);
    }
  },

  exportNoteAsTxt: (note: Note) => {
    const filename = `${note.title || 'Untitled'}.txt`;
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
