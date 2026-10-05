import { useEffect, useState } from 'react';
import { Star, FolderOpen, Download, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { DocumentCard } from '@/components/DocumentCard';
import { DocumentCardSkeleton } from '@/components/Skeleton';
import type { Document } from '@/types';
import { logActivity } from '@/lib/activity';

export function FavoritesPage() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });
    setDocs((data ?? []) as Document[]);
    setLoading(false);
  };

  const handleDownload = async (doc: Document) => {
    const { data, error } = await supabase.storage.from('documents').download(doc.storage_path);
    if (error || !data) { showToast('Failed to download', 'error'); return; }
    const url = URL.createObjectURL(data);
    const a = window.document.createElement('a');
    a.href = url; a.download = doc.file_name;
    window.document.body.appendChild(a); a.click();
    window.document.body.removeChild(a); URL.revokeObjectURL(url);
    await logActivity('download', 'document', doc.id, `Downloaded "${doc.title}"`);
    showToast('Download started', 'success');
  };

  const handleToggleFavorite = async (doc: Document) => {
    const { error } = await supabase.from('documents').update({ is_favorite: false }).eq('id', doc.id);
    if (error) { showToast('Failed to update', 'error'); return; }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    showToast('Removed from favorites', 'success');
  };

  const handleDelete = async (doc: Document) => {
    const { error } = await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', doc.id);
    if (error) { showToast('Failed to move to trash', 'error'); return; }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    await logActivity('delete', 'document', doc.id, `Moved "${doc.title}" to trash`);
    showToast('Moved to trash', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-400" /> Favorites
        </h1>
        <p className="text-sm text-slate-400 mt-1">{docs.length} favorited document{docs.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <DocumentCardSkeleton key={i} />)}
        </div>
      ) : docs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onToggleFavorite={handleToggleFavorite} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Star className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No favorites yet</p>
          <p className="text-sm text-slate-500 mt-1">Star important documents to find them quickly here</p>
        </div>
      )}
    </div>
  );
}

export function TrashPage() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });
    setDocs((data ?? []) as Document[]);
    setLoading(false);
  };

  const handleRestore = async (doc: Document) => {
    const { error } = await supabase.from('documents').update({ is_deleted: false, deleted_at: null }).eq('id', doc.id);
    if (error) { showToast('Failed to restore', 'error'); return; }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    await logActivity('restore', 'document', doc.id, `Restored "${doc.title}" from trash`);
    showToast('Document restored', 'success');
  };

  const handlePermanentDelete = async () => {
    if (!confirmDelete) return;
    // Delete file from storage
    await supabase.storage.from('documents').remove([confirmDelete.storage_path]);
    const { error } = await supabase.from('documents').delete().eq('id', confirmDelete.id);
    if (error) { showToast('Failed to delete permanently', 'error'); return; }
    setDocs((prev) => prev.filter((d) => d.id !== confirmDelete.id));
    await logActivity('permanent_delete', 'document', confirmDelete.id, `Permanently deleted "${confirmDelete.title}"`);
    showToast('Document permanently deleted', 'success');
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-slate-400" /> Trash
        </h1>
        <p className="text-sm text-slate-400 mt-1">{docs.length} item{docs.length !== 1 ? 's' : ''} in trash</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <DocumentCardSkeleton key={i} />)}</div>
      ) : docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{doc.category} • Deleted {new Date(doc.deleted_at ?? doc.updated_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleRestore(doc)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-all">
                <RotateCcw className="h-4 w-4" /> Restore
              </button>
              <button onClick={() => setConfirmDelete(doc)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Trash2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Trash is empty</p>
          <p className="text-sm text-slate-500 mt-1">Deleted documents will appear here</p>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Permanently delete?</h3>
            <p className="text-sm text-slate-400 mt-2">
              "{confirmDelete.title}" will be permanently deleted. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all">Cancel</button>
              <button onClick={handlePermanentDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityPage() {
  const [activities, setActivities] = useState<{ id: string; action: string; entity_type: string; details: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    setLoading(true);
    const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100);
    setActivities(data ?? []);
    setLoading(false);
  };

  const actionIcons: Record<string, { icon: typeof Star; color: string; bg: string }> = {
    upload: { icon: FolderOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    download: { icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    view: { icon: Star, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
    restore: { icon: RotateCcw, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    permanent_delete: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
    update: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    profile_update: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-slate-400 mt-1">Track all actions in your vault</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : activities.length > 0 ? (
        <div className="glass rounded-2xl p-4">
          <div className="space-y-1">
            {activities.map((act, idx) => {
              const config = actionIcons[act.action] ?? actionIcons.view;
              const Icon = config.icon;
              return (
                <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all relative">
                  {idx < activities.length - 1 && (
                    <div className="absolute left-[26px] top-12 bottom-0 w-px bg-white/5" />
                  )}
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 z-10`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-white">{act.details}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="capitalize">{act.action.replace('_', ' ')}</span>
                      {act.entity_type && <span> • {act.entity_type}</span>}
                      {' • '}{formatDate(act.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-slate-400 font-medium">No activity yet</p>
          <p className="text-sm text-slate-500 mt-1">Your actions will be tracked here</p>
        </div>
      )}
    </div>
  );
}
