import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { Note } from './types';
import { storage } from './lib/storage';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { FileUp } from 'lucide-react';
import { motion } from 'motion/react';

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Initial Load
  useEffect(() => {
    const savedNotes = storage.getNotes();
    if (savedNotes.length === 0) {
      // Create starter note
      const starterNote: Note = {
        id: generateId(),
        title: 'Welcome to Void Notes',
        body: 'A minimalist space for your thoughts.\n\nEverything is stored locally in your browser. No cloud, no tracking, just you and your words.\n\nTips:\n- Use Ctrl+N for a new note\n- Use the pin icon to keep important notes at the top\n- Export any note as a .txt file using the download icon',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: true
      };
      setNotes([starterNote]);
      setSelectedId(starterNote.id);
    } else {
      setNotes(savedNotes);
      const lastId = storage.getLastOpenedId();
      if (lastId && savedNotes.find(n => n.id === lastId)) {
        setSelectedId(lastId);
      } else {
        setSelectedId(savedNotes[0].id);
      }
    }
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (notes.length > 0) {
      storage.saveNotes(notes);
    }
  }, [notes]);

  useEffect(() => {
    storage.setLastOpenedId(selectedId);
  }, [selectedId]);

  // Handlers
  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: '',
      body: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: Date.now()
        };
        // Auto-generate title if empty and typing body
        if (!updatedNote.title && updatedNote.body && updates.body) {
          const firstLine = updatedNote.body.trim().split('\n')[0].substring(0, 30);
          if (firstLine) updatedNote.title = firstLine;
        }
        return updatedNote;
      }
      return note;
    }));
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const remaining = prev.filter(n => n.id !== id);
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  }, [selectedId]);

  const handleTogglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  }, []);

  const handleDuplicate = useCallback((note: Note) => {
    const duplicate: Note = {
      ...note,
      id: generateId(),
      title: `${note.title || 'Untitled'} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false
    };
    setNotes(prev => [duplicate, ...prev]);
    setSelectedId(duplicate.id);
  }, []);

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newNote: Note = {
          id: generateId(),
          title: file.name.replace('.txt', ''),
          body: content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setNotes(prev => [newNote, ...prev]);
        setSelectedId(newNote.id);
      };
      reader.readAsText(file);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        // Find focus search (not implemented specifically but good for future)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  const selectedNote = notes.find(n => n.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-black text-neutral-300 font-sans selection:bg-neutral-800">
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={handleCreateNote}
        onDelete={handleDeleteNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        showInstallBtn={showInstallBtn}
        onInstall={handleInstallClick}
      />

      <Editor
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        onExport={storage.exportNoteAsTxt}
        onDuplicate={handleDuplicate}
        onTogglePin={handleTogglePin}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Hidden File Input for Import */}
      <input
        type="file"
        id="import-file"
        className="hidden"
        accept=".txt"
        onChange={handleImport}
      />

      {/* Floating Import Button */}
      <motion.label
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        htmlFor="import-file"
        className="fixed bottom-6 right-6 p-4 bg-accent text-amoled-black rounded-full shadow-lg cursor-pointer transition-colors z-10 md:hidden flex items-center justify-center"
        title="Import .txt"
        aria-label="Import .txt"
      >
        <FileUp size={24} />
      </motion.label>
    </div>
  );
}
