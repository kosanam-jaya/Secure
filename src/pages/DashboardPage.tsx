import { Link } from 'react-router-dom';
import {
  FileText, HardDrive, FolderOpen, Star, Upload, UserCircle,
  Clock, AlertTriangle, TrendingUp, ArrowRight, Plus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { FileIcon } from '@/components/FileIcon';
import { DocumentCard } from '@/components/DocumentCard';
import { DocumentCardSkeleton } from '@/components/Skeleton';
import { UploadModal } from '@/components/UploadModal';
import { formatBytes, formatDate, timeAgo } from '@/lib/utils';
import { CATEGORIES, type Document } from '@/types';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    const documents = (data ?? []) as Document[];
    setDocs(documents);

    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    });
    setCategoryCounts(counts);
    setLoading(false);
  };

  const totalSize = docs.reduce((sum, d) => sum + d.file_size, 0);
  const favorites = docs.filter((d) => d.is_favorite).length;
  const recentDocs = docs.slice(0, 5);
  const expiringDocs = docs.filter((d) => {
    if (!d.expiry_date) return false;
    const days = (new Date(d.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  });

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Student'} 
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here's what's in your secure vault</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30"
        >
          <Upload className="h-4 w-4" /> Quick Upload
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: docs.length, icon: FileText, bg: 'bg-blue-500/10', text: 'text-blue-400' },
          { label: 'Storage Used', value: formatBytes(totalSize), icon: HardDrive, bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
          { label: 'Categories', value: Object.keys(categoryCounts).length, icon: FolderOpen, bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
          { label: 'Favorites', value: favorites, icon: Star, bg: 'bg-amber-500/10', text: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.text)} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
            <Link to="/locker" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <DocumentCardSkeleton key={i} />)}
            </div>
          ) : recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} variant="compact" showActions={false} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No documents yet</p>
              <p className="text-sm text-slate-500 mt-1">Upload your first document to get started</p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
              >
                <Plus className="h-4 w-4" /> Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/upload" onClick={() => setUploadOpen(true)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Upload Document</p>
                  <p className="text-xs text-slate-500">Add a new file to your vault</p>
                </div>
              </Link>
              <Link to="/personal-info" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Personal Info</p>
                  <p className="text-xs text-slate-500">Update your details</p>
                </div>
              </Link>
              <Link to="/favorites" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Favorites</p>
                  <p className="text-xs text-slate-500">Your starred documents</p>
                </div>
              </Link>
              <Link to="/activity" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Activity Log</p>
                  <p className="text-xs text-slate-500">Track your actions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Expiry reminders */}
          {expiringDocs.length > 0 && (
            <div className="glass rounded-2xl p-5 border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Expiry Reminders</h2>
              </div>
              <div className="space-y-2">
                {expiringDocs.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <FileIcon fileType={doc.file_type} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                      <p className="text-xs text-amber-400">Expires {formatDate(doc.expiry_date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Storage analytics */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Storage by Category</h2>
            </div>
            {Object.keys(categoryCounts).length > 0 ? (
              <div className="space-y-2.5">
                {CATEGORIES.filter((c) => categoryCounts[c]).map((cat) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{cat}</span>
                      <span className="text-slate-500">{categoryCounts[cat]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                        style={{ width: `${(categoryCounts[cat] / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={fetchDashboard} />
    </div>
  );
}
