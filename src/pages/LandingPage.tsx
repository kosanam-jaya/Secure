import { Link } from 'react-router-dom';
import {
  Shield, ShieldCheck, Lock, FileText, Search, Download, Trash2,
  Star, Activity, BarChart3, Bell, FolderLock, Zap, Eye, ArrowRight,
  Check, Smartphone, Globe, Cloud, KeyRound, FileCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen vault-gradient">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0e1a]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50" />
              <FolderLock className="relative h-7 w-7 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SecureVault</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 overflow-hidden grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e1a]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-in">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-300">Bank-grade encryption for your documents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight animate-fade-in">
            Everything Important.
            <br />
            <span className="text-gradient">One Secure Place.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            SecureVault is your private digital locker. Store, organize, and access
            all your important documents and personal information — securely, from anywhere.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/signup"
              className="group px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl glass hover:bg-white/10 text-white font-semibold transition-all"
            >
              I already have an account
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> 10MB file uploads</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Private & encrypted</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">The Problem</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Your documents are everywhere.</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Students keep important documents scattered across phones, laptops, email, cloud storage and messaging apps.
              Finding what you need, when you need it, is a nightmare.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Smartphone, label: 'Phone Gallery', desc: 'Screenshots buried in photos' },
              { icon: FileText, label: 'Email Attachments', desc: 'Lost in inbox clutter' },
              { icon: Cloud, label: 'Cloud Drives', desc: 'Scattered across services' },
              { icon: Globe, label: 'Messaging Apps', desc: 'Sent and forgotten' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-6 text-center hover:bg-white/[0.08] transition-all">
                <item.icon className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Features</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Everything you need in one locker</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Document Storage', desc: 'Upload PDFs, images, and common document formats. Organize with categories, tags, and descriptions.' },
              { icon: Search, title: 'Smart Search & Filter', desc: 'Find any document instantly by name, tag, category, or file type. Sort by date or name.' },
              { icon: Eye, title: 'Document Preview', desc: 'Preview PDFs and images right in your browser. No download needed.' },
              { icon: Download, title: 'Download Anytime', desc: 'Download your documents whenever you need them, from any device.' },
              { icon: Star, title: 'Favorites', desc: 'Mark important documents as favorites for quick access when you need them most.' },
              { icon: Trash2, title: 'Secure Trash', desc: 'Deleted documents go to trash first. Restore them or permanently delete them.' },
              { icon: Bell, title: 'Expiry Reminders', desc: 'Set expiry dates on documents like IDs and certificates. Get reminded before they expire.' },
              { icon: BarChart3, title: 'Storage Analytics', desc: 'Visualize your storage usage with charts. See breakdown by category and file type.' },
              { icon: Activity, title: 'Activity Log', desc: 'Track every action — uploads, views, downloads, deletions, and profile updates.' },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 relative border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Security</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Built secure from the ground up</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Your data is protected with industry-standard security measures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Lock, title: 'Password Hashing', desc: 'Passwords are securely hashed using bcrypt. We never store or see your plain-text password.' },
              { icon: KeyRound, title: 'Row-Level Security', desc: 'Every database query is enforced with RLS policies. You can only ever access your own data.' },
              { icon: Shield, title: 'Protected Routes', desc: 'All application routes are protected. Unauthenticated users cannot access your locker.' },
              { icon: FileCheck, title: 'File Validation', desc: 'File types and sizes are validated on upload. Only allowed formats within size limits are accepted.' },
              { icon: Eye, title: 'Private Storage', desc: 'Files are stored in private buckets with per-user folder isolation. No public access.' },
              { icon: Zap, title: 'Session Management', desc: 'Secure session handling with automatic token refresh. Sign out anytime from any device.' },
            ].map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 flex items-start gap-4 hover:bg-white/[0.08] transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative glass-strong rounded-3xl p-12 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <ShieldCheck className="relative h-14 w-14 text-blue-400 mx-auto mb-6" />
            <h2 className="relative text-3xl font-bold text-white">Ready to secure your documents?</h2>
            <p className="relative mt-3 text-slate-400">
              Join SecureVault today and keep everything important in one safe place.
            </p>
            <Link
              to="/signup"
              className="relative inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-blue-500/30"
            >
              Create Your Vault
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-white">SecureVault</span>
          </div>
          <p className="text-sm text-slate-500">Built for student hackathon — Your privacy, our priority.</p>
        </div>
      </footer>
    </div>
  );
}
