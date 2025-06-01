import React from 'react';
import { X } from 'lucide-react';

interface VerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function VerseModal({ isOpen, onClose, title, content }: VerseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-xl font-semibold highlight-gradient bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/50 transition-all duration-300"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}