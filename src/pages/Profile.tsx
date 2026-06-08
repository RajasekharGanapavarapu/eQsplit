import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { api } from '../lib/api';
import { Edit2, Check, X } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [newAvatar, setNewAvatar] = useState(profile?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await api.updateProfile(profile.id, newName, newAvatar);
      window.location.reload(); // Hard reload to fetch new state across entire app
    } catch (err: any) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn relative">
      <div className={`${glassClass} p-6 md:p-8 text-center relative overflow-hidden`}>
        <div className="absolute top-4 left-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-mono rounded-lg px-2.5 py-1">
          PRO MEMBER
        </div>

        {!isEditing && (
          <button onClick={() => { setIsEditing(true); setNewName(profile?.name || ''); setNewAvatar(profile?.avatar_url || ''); }} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-400 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition">
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        <div className="relative inline-block mt-4">
          <img 
            src={isEditing ? (newAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80") : (profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80")} 
            alt="Avatar" 
            onError={(e) => {
              // If the user's custom URL fails to load, fallback to the default image
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80";
            }}
            className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-indigo-500/20" 
          />
          <div className="absolute bottom-0 right-1 w-6 h-6 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Identity Verified"></div>
        </div>

        {isEditing ? (
          <div className="mt-6 space-y-4 text-left max-w-sm mx-auto">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Avatar Image URL</label>
              <input type="url" value={newAvatar} onChange={e => setNewAvatar(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button disabled={isSaving} onClick={handleSave} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mt-4 tracking-tight">{profile?.name || 'User'}</h2>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl">
              <span className="text-xs font-mono text-slate-400">Splitzy ID:</span>
              <span className="text-xs font-mono text-indigo-300 font-semibold tracking-wide">{profile?.splitflow_id || 'SPF-XXXXXX'}</span>
            </div>
          </>
        )}

        <p className="text-xs text-slate-500 mt-6">
          Account lifecycle initiated {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Recently'}
        </p>
      </div>

      <div className={`${glassClass} p-6 space-y-4`}>
        <h3 className="text-sm font-medium tracking-wide uppercase text-slate-400">Preferences</h3>
        <div className="flex items-center justify-between text-sm py-1 border-t border-white/[0.04] pt-3">
          <span className="text-slate-300">Default Currency Matrix</span>
          <span className="text-emerald-400 text-xs font-medium">Rupees (₹)</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1 border-t border-white/[0.04] pt-3">
          <span className="text-slate-300">Biometric Ledger Authorization</span>
          <span className="text-emerald-400 text-xs font-medium">Active</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1 border-t border-white/[0.04] pt-3">
          <span className="text-slate-300">Push Settlement Reminders</span>
          <span className="text-slate-400 text-xs">Enabled</span>
        </div>
      </div>

      <button onClick={handleSignOut} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium py-3 rounded-xl transition text-sm">
        Disconnect Session (Log Out)
      </button>
    </div>
  );
}
