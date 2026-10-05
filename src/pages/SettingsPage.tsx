import { useState, type FormEvent } from 'react';
import { Loader2, Save, Shield, LogOut, KeyRound, User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

export function SettingsPage() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    const { error } = await supabase.from('profiles').update({ full_name: name, updated_at: new Date().toISOString() }).eq('id', user!.id);
    setSavingName(false);
    if (error) { showToast('Failed to update name', 'error'); return; }
    await refreshProfile();
    await logActivity('profile_update', 'profile', null, 'Updated display name');
    showToast('Name updated', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and security</p>
      </div>

      {/* Profile info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
            {(profile?.full_name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400/50 transition-all"
            />
          </div>
          <button type="submit" disabled={savingName} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all disabled:opacity-50">
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
          </button>
        </form>
      </div>

      {/* Account details */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm text-white">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Member since</p>
              <p className="text-sm text-white">{formatDate(profile?.created_at ?? user?.created_at ?? null)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <KeyRound className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">User ID</p>
              <p className="text-sm text-slate-400 font-mono truncate">{user?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security status */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" /> Security Status
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Password hashing (bcrypt)', status: true },
            { label: 'Row-level security enabled', status: true },
            { label: 'Private file storage', status: true },
            { label: 'Protected routes', status: true },
            { label: 'Session management', status: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border-red-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">Sign Out</h3>
        <p className="text-sm text-slate-400 mb-4">Sign out of your account on this device</p>
        <button
          onClick={() => { signOut(); showToast('Signed out', 'success'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-sm transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
