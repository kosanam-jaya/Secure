import { useEffect, useState, type FormEvent } from 'react';
import { Save, Loader2, Phone, Mail, MapPin, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { PersonalInfo } from '@/types';
import { logActivity } from '@/lib/activity';

export function PersonalInfoPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    student_id: '',
    college: '',
    course: '',
    branch: '',
    year_semester: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    blood_group: '',
  });

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    const { data } = await supabase.from('personal_info').select('*').eq('user_id', user!.id).maybeSingle();
    if (data) {
      const d = data as PersonalInfo;
      setInfo(d);
      setForm({
        full_name: d.full_name ?? '',
        student_id: d.student_id ?? '',
        college: d.college ?? '',
        course: d.course ?? '',
        branch: d.branch ?? '',
        year_semester: d.year_semester ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        address: d.address ?? '',
        emergency_contact: d.emergency_contact ?? '',
        blood_group: d.blood_group ?? '',
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (info) {
      const { error } = await supabase
        .from('personal_info')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', info.id);
      if (error) {
        showToast('Failed to save information', 'error');
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('personal_info').insert({ ...form, user_id: user!.id });
      if (error) {
        showToast('Failed to save information', 'error');
        setSaving(false);
        return;
      }
    }

    await logActivity('profile_update', 'personal_info', null, 'Updated personal information');
    showToast('Personal information saved', 'success');
    setSaving(false);
    fetchInfo();
  };

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const completionPercent = Math.round(
    (Object.values(form).filter((v) => v.trim().length > 0).length / 11) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Personal Information</h1>
        <p className="text-sm text-slate-400 mt-1">Keep your details secure and up to date</p>
      </div>

      {/* Completion bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Profile Completion</span>
          </div>
          <span className="text-sm font-bold text-blue-400">{completionPercent}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
        </div>
        {completionPercent < 100 && (
          <p className="text-xs text-slate-500 mt-2">Fill in all fields to complete your profile</p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-6">
          {/* Basic */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.full_name} onChange={(v) => update('full_name', v)} placeholder="John Doe" />
              <Field label="Student ID / Roll Number" value={form.student_id} onChange={(v) => update('student_id', v)} placeholder="e.g. 21CS001" />
              <Field label="College" value={form.college} onChange={(v) => update('college', v)} placeholder="Your college name" />
              <Field label="Course" value={form.course} onChange={(v) => update('course', v)} placeholder="e.g. B.Tech" />
              <Field label="Branch" value={form.branch} onChange={(v) => update('branch', v)} placeholder="e.g. Computer Science" />
              <Field label="Year / Semester" value={form.year_semester} onChange={(v) => update('year_semester', v)} placeholder="e.g. 3rd Year / 5th Sem" />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="you@example.com" icon={Mail} />
              <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+1 234 567 890" icon={Phone} />
              <div className="md:col-span-2">
                <Field label="Address" value={form.address} onChange={(v) => update('address', v)} placeholder="Your full address" icon={MapPin} />
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Emergency Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Emergency Contact" value={form.emergency_contact} onChange={(v) => update('emergency_contact', v)} placeholder="Name and phone number" icon={AlertCircle} />
              <Field label="Blood Group" value={form.blood_group} onChange={(v) => update('blood_group', v)} placeholder="e.g. O+" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Information</>}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, icon: Icon,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; icon?: typeof Mail;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all text-sm`}
        />
      </div>
    </div>
  );
}
