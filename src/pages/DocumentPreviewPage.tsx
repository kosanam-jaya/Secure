import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Download, Star, Trash2, Edit2, Tag, Calendar, HardDrive,
  FileText, Clock, AlertTriangle, Loader2, X, Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { FileIcon } from '@/components/FileIcon';
import { formatBytes, formatDate, formatDateTime, getFileExtension } from '@/lib/utils';
import { CATEGORIES, type Document, type DocumentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

export function DocumentPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>('Other');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDoc = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').eq('id', id!).maybeSingle();
    if (!data) {
      setLoading(false);
      return;
    }
    const document = data as Document;
    setDoc(document);
    setEditTitle(document.title);
    setEditCategory(document.category as DocumentCategory);
    setEditDescription(document.description);
    setEditTags(document.tags.join(', '));
    setEditExpiry(document.expiry_date ?? '');

    // Track view
    await supabase.from('document_views').insert({ document_id: document.id });
    await logActivity('view', 'document', document.id, `Viewed "${document.title}"`);

    // Get file URL
    if (document.file_type.startsWith('image/') || document.file_type === 'application/pdf') {
      const { data: urlData } = await supabase.storage.from('documents').createSignedUrl(document.storage_path, 3600);
      if (urlData?.signedUrl) setFileUrl(urlData.signedUrl);
    }

    setLoading(false);
  };

  const handleDownload = async () => {
    if (!doc) return;
    const { data, error } = await supabase.storage.from('documents').download(doc.storage_path);
    if (error || !data) {
      showToast('Failed to download file', 'error');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = doc.file_name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await logActivity('download', 'document', doc.id, `Downloaded "${doc.title}"`);
    showToast('Download started', 'success');
  };

  const handleToggleFavorite = async () => {
    if (!doc) return;
    const { error } = await supabase.from('documents').update({ is_favorite: !doc.is_favorite }).eq('id', doc.id);
    if (error) {
      showToast('Failed to update favorite', 'error');
      return;
    }
    setDoc({ ...doc, is_favorite: !doc.is_favorite });
    showToast(doc.is_favorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleDelete = async () => {
    if (!doc) return;
    const { error } = await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', doc.id);
    if (error) {
      showToast('Failed to move to trash', 'error');
      return;
    }
    await logActivity('delete', 'document', doc.id, `Moved "${doc.title}" to trash`);
    showToast('Document moved to trash', 'success');
    navigate('/locker');
  };

  const handleSaveEdit = async () => {
    if (!doc) return;
    setSaving(true);
    const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from('documents')
      .update({
        title: editTitle,
        category: editCategory,
        description: editDescription,
        tags,
        expiry_date: editExpiry || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', doc.id);
    setSaving(false);
    if (error) {
      showToast('Failed to update document', 'error');
      return;
    }
    setDoc({ ...doc, title: editTitle, category: editCategory, description: editDescription, tags, expiry_date: editExpiry || null });
    await logActivity('update', 'document', doc.id, `Updated "${editTitle}"`);
    showToast('Document updated', 'success');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Document not found</p>
        <Link to="/locker" className="mt-4 inline-block text-blue-400 hover:text-blue-300">Back to Locker</Link>
      </div>
    );
  }

  const isExpiringSoon = doc.expiry_date && (new Date(doc.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30 && (new Date(doc.expiry_date).getTime() - Date.now()) >= 0;
  const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/locker" className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white truncate">{doc.title}</h1>
          <p className="text-sm text-slate-400">{doc.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(!editing)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Edit">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={handleToggleFavorite} className="p-2.5 rounded-xl hover:bg-white/10 transition-colors" title="Favorite">
            <Star className={cn('h-4 w-4', doc.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400')} />
          </button>
          <button onClick={handleDownload} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-4 min-h-[400px] flex items-center justify-center">
            {fileUrl ? (
              doc.file_type === 'application/pdf' ? (
                <iframe src={fileUrl} className="w-full h-[600px] rounded-xl bg-white" title={doc.title} />
              ) : doc.file_type.startsWith('image/') ? (
                <img src={fileUrl} alt={doc.title} className="max-w-full max-h-[600px] rounded-xl object-contain" />
              ) : (
                <div className="text-center py-16">
                  <FileIcon fileType={doc.file_type} size={64} className="mx-auto mb-4" />
                  <p className="text-slate-400">Preview not available for this file type</p>
                  <button onClick={handleDownload} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
                    <Download className="h-4 w-4" /> Download to view
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <FileIcon fileType={doc.file_type} size={64} className="mx-auto mb-4" />
                <p className="text-slate-400">Preview not available for this file type</p>
                <button onClick={handleDownload} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
                  <Download className="h-4 w-4" /> Download to view
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details / Edit */}
        <div className="space-y-4">
          {editing ? (
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Edit Document</h3>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as DocumentCategory)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all [color-scheme:dark]">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Tags (comma-separated)</label>
                <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Expiry Date</label>
                <input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all [color-scheme:dark]" />
              </div>
              <button onClick={handleSaveEdit} disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-white">Details</h3>
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <FileIcon fileType={doc.file_type} size={48} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.file_name}</p>
                  <p className="text-xs text-slate-500">{getFileExtension(doc.file_name)} • {formatBytes(doc.file_size)}</p>
                </div>
              </div>

              {doc.description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-300">{doc.description}</p>
                </div>
              )}

              {doc.tags.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Tag className="h-3 w-3" /> Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <HardDrive className="h-4 w-4 text-slate-500" /> {formatBytes(doc.file_size)}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" /> Added {formatDate(doc.created_at)}
                </div>
                {doc.expiry_date && (
                  <div className={cn('flex items-center gap-2', isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-slate-400')}>
                    <Calendar className="h-4 w-4" />
                    {isExpired ? 'Expired' : 'Expires'} {formatDate(doc.expiry_date)}
                  </div>
                )}
              </div>

              {isExpiringSoon && !isExpired && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 text-sm text-amber-300">
                  <AlertTriangle className="h-4 w-4" /> This document expires soon
                </div>
              )}
              {isExpired && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4" /> This document has expired
                </div>
              )}

              <button onClick={handleDownload} className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Move to trash?</h3>
            <p className="text-sm text-slate-400 mt-2">"{doc.title}" will be moved to trash. You can restore it later or permanently delete it.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all">Move to Trash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
