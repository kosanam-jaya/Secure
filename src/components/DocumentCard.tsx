import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Eye, Trash2, MoreVertical, Tag, Calendar, HardDrive } from 'lucide-react';
import { FileIcon } from '@/components/FileIcon';
import { formatBytes, formatDate, cn, getFileExtension } from '@/lib/utils';
import type { Document } from '@/types';

interface DocumentCardProps {
  doc: Document;
  onToggleFavorite?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function DocumentCard({ doc, onToggleFavorite, onDelete, onDownload, showActions = true, variant = 'default' }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="glass rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all group relative">
      <div className="flex items-start gap-4">
        <FileIcon fileType={doc.file_type} size={48} className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/documents/${doc.id}`}
              className="text-sm font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1"
            >
              {doc.title}
            </Link>
            {showActions && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-8 z-20 w-44 glass-strong rounded-xl py-1.5 animate-scale-in">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </Link>
                      {onDownload && (
                        <button
                          onClick={() => { onDownload(doc); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Download className="h-4 w-4" /> Download
                        </button>
                      )}
                      {onToggleFavorite && (
                        <button
                          onClick={() => { onToggleFavorite(doc); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Star className={cn('h-4 w-4', doc.is_favorite && 'fill-amber-400 text-amber-400')} />
                          {doc.is_favorite ? 'Remove Favorite' : 'Add Favorite'}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => { onDelete(doc); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium">
              {doc.category}
            </span>
            <span className="text-xs text-slate-500">{getFileExtension(doc.file_name)}</span>
          </div>

          {variant === 'default' && doc.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{doc.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {formatBytes(doc.file_size)}</span>
            <span>{formatDate(doc.created_at)}</span>
            {doc.expiry_date && (
              <span className="flex items-center gap-1 text-amber-400">
                <Calendar className="h-3 w-3" /> Expires {formatDate(doc.expiry_date)}
              </span>
            )}
          </div>

          {variant === 'default' && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {doc.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {doc.is_favorite && (
          <Star className="absolute top-4 right-4 h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
