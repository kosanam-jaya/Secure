import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderLock, Upload, UserCircle, Star,
  Trash2, Activity, Settings, LogOut, FolderLock as Logo,
  Menu, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UploadModal } from '@/components/UploadModal';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/locker', label: 'My Locker', icon: FolderLock },
  { to: '/upload', label: 'Upload', icon: Upload, action: 'upload' },
  { to: '/personal-info', label: 'Personal Info', icon: UserCircle },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully', 'success');
    navigate('/');
  };

  const handleNavClick = (item: typeof navItems[number]) => {
    if (item.action === 'upload') {
      setUploadOpen(true);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen vault-gradient">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl z-40 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <Logo className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-white">SecureVault</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => handleNavClick(item)}
                className="w-full"
              >
                <Link
                  to={item.action ? '#' : item.to}
                  onClick={(e) => item.action && e.preventDefault()}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {(profile?.full_name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Secured
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a0e1a] border-r border-white/10 flex flex-col animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              <Link to="/dashboard" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                <Logo className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-white">SecureVault</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <button
                    key={item.to}
                    onClick={() => { handleNavClick(item); if (!item.action) setSidebarOpen(false); }}
                    className="w-full"
                  >
                    <Link
                      to={item.action ? '#' : item.to}
                      onClick={(e) => item.action && e.preventDefault()}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar - mobile */}
        <header className="md:hidden h-16 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white">SecureVault</span>
          </Link>
          <button onClick={() => setUploadOpen(true)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Upload className="h-5 w-5" />
          </button>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => {}} />
    </div>
  );
}
