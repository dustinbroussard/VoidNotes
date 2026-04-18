import React, { FC, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Trash2, Save, Download, Copy, Pin, Menu, FileUp, FileText, X, Hash, Type, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface EditorProps {
  note: Note | null;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onExport: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onTogglePin: (id: string) => void;
  toggleSidebar: () => void;
}

export const Editor: FC<EditorProps> = ({
  note,
  onUpdate,
  onDelete,
  onExport,
  onDuplicate,
  onTogglePin,
  toggleSidebar
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      if (window.innerWidth >= 768) {
        textareaRef.current.focus();
      }
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-amoled-black text-text-secondary p-8 text-center">
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 rounded-full border border-border flex items-center justify-center mb-8"
        >
          <FileText size={40} className="opacity-10" />
        </motion.div>
        <div className="flex gap-4">
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="w-1 h-1 rounded-full bg-border" />
        </div>
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
          className="p-2 -ml-2 text-text-secondary"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </motion.button>
        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
      </div>

      {/* Toolbar */}
      <header className="flex justify-end items-center gap-2 md:gap-4 mb-10">
        <label
          htmlFor="import-file"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all cursor-pointer"
          title="Import"
          aria-label="Import"
        >
          <FileUp size={18} />
        </label>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onExport(note)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
          title="Export"
          aria-label="Export"
        >
          <Download size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDuplicate(note)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
          title="Duplicate"
          aria-label="Duplicate"
        >
          <Copy size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onTogglePin(note.id)}
          className={`p-2 rounded-lg transition-all ${note.isPinned ? 'text-accent bg-surface' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
          title={note.isPinned ? 'Unpin' : 'Pin'}
          aria-label={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={18} fill={note.isPinned ? 'currentColor' : 'none'} />
        </motion.button>

        <div className="w-[1px] h-4 bg-border mx-1" />

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
          className={`p-2 rounded-lg transition-all ${isDeleting ? 'text-red-500 bg-red-500/20' : 'text-red-500/60 hover:text-red-500 hover:bg-red-500/10'}`}
          title={isDeleting ? "Confirm Delete" : "Delete"}
          aria-label="Delete"
        >
          {isDeleting ? <X size={18} /> : <Trash2 size={18} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const btn = document.getElementById('save-btn-icon');
            if (btn) {
              btn.classList.add('text-green-500', 'bg-green-500/10');
              setTimeout(() => btn.classList.remove('text-green-500', 'bg-green-500/10'), 1000);
            }
          }}
          id="save-btn-icon"
          className="p-2 rounded-lg text-accent border border-border hover:bg-surface transition-all"
          title="Save"
          aria-label="Save"
        >
          <Save size={18} />
        </motion.button>
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
      </div>

      {/* Stats Bar */}
      <footer className="mt-8 pt-5 border-t border-border flex justify-between items-center text-[10px] font-mono text-text-secondary/30 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Hash size={12} className="opacity-50" />
            <span>{wordCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Type size={12} className="opacity-50" />
            <span>{charCount}</span>
          </div>
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
