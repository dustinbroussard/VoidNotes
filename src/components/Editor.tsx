import React, { FC, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Trash2, Download, Copy, Pin, Menu, FileUp, FileText, X, Hash, Type, Info, Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDictation } from '../lib/useDictation';

interface EditorProps {
  note: Note | null;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onExport: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onTogglePin: (id: string) => void;
  toggleSidebar: () => void;
  onCreateNote: () => void;
}

export const Editor: FC<EditorProps> = ({
  note,
  onUpdate,
  onDelete,
  onExport,
  onDuplicate,
  onTogglePin,
  toggleSidebar,
  onCreateNote
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const shouldStartDictationRef = useRef(false);

  const noteRef = useRef(note);
  useEffect(() => { noteRef.current = note; }, [note]);

  const { isSupported, isListening, interimText, error, start, stop, toggle } = useDictation({
    onFinalTranscript: (text) => {
      const currentNote = noteRef.current;
      if (currentNote) {
        const separator = currentNote.body.trim().length > 0 ? ' ' : '';
        onUpdate(currentNote.id, { 
          body: `${currentNote.body}${separator}${text}` 
        });
      }
    }
  });

  const handleMicClick = () => {
    if (!noteRef.current) {
      shouldStartDictationRef.current = true;
      onCreateNote();
    } else {
      toggle();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      if (window.innerWidth >= 768) {
        textareaRef.current.focus();
      }
    }
  }, [note?.id]);

  useEffect(() => {
    if (note?.id && shouldStartDictationRef.current) {
      shouldStartDictationRef.current = false;
      start();
    }
  }, [note?.id, start]);

  const openImportPicker = () => {
    document.getElementById('import-file')?.click();
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-amoled-black text-text-secondary p-8 text-center" style={{ backgroundColor: 'var(--color-amoled-black)' }}>
        <div className="relative mb-6 flex items-center justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateNote}
            className="w-20 h-20 rounded-2xl border border-border/50 bg-surface/30 flex items-center justify-center transition-all z-10"
            title="Create Note"
            aria-label="Create note"
          >
            <FileText size={32} className="opacity-20" />
          </motion.button>
          
          {isSupported && (
            <motion.button
              whileHover={{ scale: 1.1, x: 20 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
              className={`absolute left-full ml-4 min-h-[44px] min-w-[44px] rounded-full border transition-all flex items-center justify-center ${isListening ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-border/50 bg-surface/30 text-text-secondary hover:text-text-primary'}`}
              title={isListening ? "Listening..." : "Dictate Note"}
              aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
            >
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </motion.button>
          )}
        </div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-40">Select, create, or dictate</p>
        {error && <p className="font-mono text-[9px] text-red-500/70 mt-4 uppercase flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
      </div>
    );
  }

  const wordCount = note.body.trim() ? note.body.trim().split(/\s+/).length : 0;
  const charCount = note.body.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-amoled-black p-4 md:px-[60px] md:py-[40px] overflow-hidden">
      {/* Sidebar Toggle for Mobile */}
      <div className="flex md:hidden items-center justify-between mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="min-h-[44px] min-w-[44px] -ml-2 text-text-secondary flex items-center justify-center"
          aria-label="Open notes list"
        >
          <Menu size={20} />
        </motion.button>
        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
      </div>

      {/* Toolbar */}
      <header className="flex justify-end items-center gap-2 md:gap-4 mb-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={openImportPicker}
          className="min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all cursor-pointer flex items-center justify-center"
          title="Import"
          aria-label="Import"
        >
          <FileUp size={18} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onExport(note)}
          className="min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all flex items-center justify-center"
          title="Export"
          aria-label="Export"
        >
          <Download size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDuplicate(note)}
          className="min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all flex items-center justify-center"
          title="Duplicate"
          aria-label="Duplicate"
        >
          <Copy size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onTogglePin(note.id)}
          className={`min-h-[40px] min-w-[40px] rounded-lg transition-all flex items-center justify-center ${note.isPinned ? 'text-accent bg-surface' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
          title={note.isPinned ? 'Unpin' : 'Pin'}
          aria-label={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={18} fill={note.isPinned ? 'currentColor' : 'none'} />
        </motion.button>

        <div className="w-[1px] h-4 bg-border mx-1" />

        {isSupported && (
          <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMicClick}
          className={`min-h-[44px] min-w-[44px] rounded-lg transition-all flex items-center justify-center ${
              isListening 
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
            title={isListening ? "Stop Dictation" : "Dictate"}
            aria-label={isListening ? "Stop Dictation" : "Dictate"}
          >
            {isListening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!isDeleting) {
              setIsDeleting(true);
              setTimeout(() => setIsDeleting(false), 3000);
            } else {
              onDelete(note.id);
              setIsDeleting(false);
            }
          }}
          className={`min-h-[40px] min-w-[40px] rounded-lg transition-all flex items-center justify-center ${isDeleting ? 'text-red-500 bg-red-500/20' : 'text-red-500/60 hover:text-red-500 hover:bg-red-500/10'}`}
          title={isDeleting ? "Confirm Delete" : "Delete"}
          aria-label={isDeleting ? 'Confirm delete note' : 'Delete note'}
        >
          {isDeleting ? <X size={18} /> : <Trash2 size={18} />}
        </motion.button>

        <div
          className="min-h-[40px] rounded-lg border border-border px-3 flex items-center justify-center text-[9px] font-mono uppercase tracking-[0.18em] text-text-secondary/70"
          aria-label="Autosaves locally"
          title="Notes save automatically to this device"
        >
          Saved
        </div>
      </header>

      {/* Meta Data */}
      <div className="flex items-center gap-2 text-[9px] font-mono text-text-secondary/30 mb-4 uppercase tracking-tighter">
        <Info size={10} />
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        <span>•</span>
        <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          placeholder="New Title"
          className="bg-transparent text-3xl font-bold text-text-primary focus:outline-none placeholder:text-text-secondary/10 mb-6"
        />
        <textarea
          ref={textareaRef}
          value={note.body}
          onChange={(e) => onUpdate(note.id, { body: e.target.value })}
          placeholder="Begin..."
          className="flex-1 w-full bg-transparent text-[18px] leading-[1.6] text-text-primary resize-none focus:outline-none placeholder:text-text-secondary/10 font-sans"
          spellCheck={false}
        />
        
        {/* Interim Dictation Overlay */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse" />
              <div className="flex items-center gap-2 text-red-500/80 mb-1">
                <Mic size={12} className="animate-pulse" />
                <span className="text-[9px] font-mono tracking-widest uppercase">Listening</span>
                <button
                  type="button"
                  onClick={stop}
                  className="ml-auto min-h-[32px] px-2 rounded-md text-[9px] font-mono tracking-widest uppercase text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  aria-label="Stop dictation"
                >
                  Stop
                </button>
              </div>
              <p className="text-[16px] text-text-primary italic opacity-70 min-h-[1.5em]">
                {interimText || "Waiting for speech..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Bar */}
      <footer className="mt-8 pt-5 border-t border-border flex justify-between items-center text-[10px] font-mono text-text-secondary/30 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 focus:outline-none">
            <Hash size={12} className="opacity-50" />
            <span>{wordCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Type size={12} className="opacity-50" />
            <span>{charCount}</span>
          </div>
          {error && (
            <div className="flex items-center gap-1 text-red-500/70 ml-2 uppercase">
              <AlertCircle size={10} />
              <span>{error}</span>
            </div>
          )}
        </div>
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span className="tracking-[0.3em]">VOID</span>
        </motion.div>
      </footer>
    </div>
  );
};
