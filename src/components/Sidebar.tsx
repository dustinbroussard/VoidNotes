import React, { FC } from 'react';
import { Search, Plus, Pin, FileText, Trash2, X, Download, Copy, Menu, Info, Share, FileUp, ArrowDownCircle } from 'lucide-react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  showInstallBtn?: boolean;
  onInstall?: () => void;
}

const TrashIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isConfirming) {
          setIsConfirming(true);
          setTimeout(() => setIsConfirming(false), 3000);
        } else {
          onClick(e);
          setIsConfirming(false);
        }
      }}
      className={`p-2 transition-all rounded-full ${isConfirming ? 'text-red-500 bg-red-500/10' : 'opacity-0 group-hover:opacity-40 hover:opacity-100 text-text-secondary'}`}
      title={isConfirming ? "Click again to confirm delete" : "Delete note"}
    >
      {isConfirming ? <X size={14} /> : <Trash2 size={14} />}
    </motion.button>
  );
};

export const Sidebar: FC<SidebarProps> = ({
  notes,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  searchTerm,
  onSearchChange,
  isOpen,
  onClose,
  showInstallBtn,
  onInstall
}) => {
  const filteredNotes = notes
    .filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.body.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-amoled-black border-r border-border transition-transform duration-300 md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                Void Notes
              </h1>
              <span className="opacity-30 text-[9px] font-mono tracking-tighter">V1.1.0</span>
            </div>
            
            <div className="flex items-center gap-1">
              {showInstallBtn && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onInstall}
                  aria-label="Install App"
                  title="Install App"
                  className="p-2 rounded-full text-accent hover:bg-surface transition-colors"
                >
                  <ArrowDownCircle size={18} />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNew}
                aria-label="New Note"
                title="New Note"
                className="p-2 rounded-full text-accent bg-surface hover:bg-neutral-800 transition-colors"
              >
                <Plus size={18} />
              </motion.button>
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-full hover:bg-surface transition-colors text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-3.5 text-xs text-text-primary focus:outline-none focus:border-text-secondary transition-all placeholder:text-text-secondary/40"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence initial={false}>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`group relative px-6 py-4 cursor-pointer border-b border-border transition-all ${
                  selectedId === note.id
                    ? 'bg-surface border-l-[3px] border-l-accent'
                    : 'border-l-[3px] border-l-transparent hover:bg-surface/50'
                }`}
                onClick={() => {
                  onSelect(note.id);
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 flex-1 truncate">
                      {note.isPinned && <Pin size={10} className="text-accent opacity-60" fill="currentColor" />}
                      <h3 className={`text-[14px] font-medium truncate ${selectedId === note.id ? 'text-text-primary' : 'text-text-primary/70'}`}>
                        {note.title || 'Untitled Note'}
                      </h3>
                    </div>
                    <TrashIcon onClick={() => onDelete(note.id)} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary/60 truncate italic font-mono">
                    <span>{new Date(note.updatedAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}</span>
                    <span>•</span>
                    <span className="truncate">{note.body || '...'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-[10px] text-text-secondary font-mono uppercase tracking-[0.2em] opacity-40">Zero Results</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
