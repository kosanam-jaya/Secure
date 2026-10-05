import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, ArrowDownUp, FolderOpen, Star, Download, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { DocumentCard } from '@/components/DocumentCard';
import { DocumentCardSkeleton } from '@/components/Skeleton';
import { UploadModal } from '@/components/UploadModal';
import { CATEGORIES, type Document, type DocumentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

type SortOption = 'newest' | 'oldest' | 'name';

export function LockerPage() {
  const { showToast } = useToast();

  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    setDocs((data ?? []) as Document[]);
    setLoading(false);
  };

  const filteredDocs = useMemo(() => {
    let result = [...docs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          d.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === 'name') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [docs, search, categoryFilter, sortBy]);

  const handleDownload = async (doc: Document) => {
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

  const handleToggleFavorite = async (doc: Document) => {
    const { error } = await supabase
      .from('documents')
      .update({ is_favorite: !doc.is_favorite })
      .eq('id', doc.id);
    if (error) {
      showToast('Failed to update favorite', 'error');
      return;
    }
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_favorite: !d.is_favorite } : d)));
    showToast(doc.is_favorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase
      .from('documents')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', confirmDelete.id);
    if (error) {
      showToast('Failed to move to trash', 'error');
      return;
    }
    setDocs((prev) => prev.filter((d) => d.id !== confirmDelete.id));
    await logActivity('delete', 'document', confirmDelete.id, `Moved "${confirmDelete.title}" to trash`);
    showToast('Document moved to trash', 'success');
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Locker</h1>
          <p className="text-sm text-slate-400 mt-1">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30"
        >
          <FolderOpen className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {/* Search & filters */}
      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tags, or description..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | 'all')}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              categoryFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                categoryFilter === cat ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <DocumentCardSkeleton key={i} />)}
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onToggleFavorite={handleToggleFavorite}
              onDelete={(d) => setConfirmDelete(d)}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          {search || categoryFilter !== 'all' ? (
            <>
              <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No documents found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
            </>
          ) : (
            <>
              <FolderOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Your locker is empty</p>
              <p className="text-sm text-slate-500 mt-1">Upload your first document to get started</p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
              >
                <FolderOpen className="h-4 w-4" /> Upload Document
              </button>
            </>
          )}
        </div>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={fetchDocs} />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Move to trash?</h3>
            <p className="text-sm text-slate-400 mt-2">
              "{confirmDelete.title}" will be moved to trash. You can restore it from the trash or permanently delete it later.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
