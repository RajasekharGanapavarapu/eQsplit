import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { Search, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  useEffect(() => {
    if (user) loadGroups();
  }, [user]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getGroups(user!.id);
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const group = await api.createGroup(newGroupName, newGroupDesc, user!.id);
      setShowCreate(false);
      setNewGroupName('');
      setNewGroupDesc('');
      navigate(`/groups/${group.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create group');
    }
  };

  if (loading) return <div className="p-8">Loading groups...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn relative">
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`${glassClass} w-full max-w-md p-6 relative`}>
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Group Name</label>
                <input type="text" required value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className={inputClass} placeholder="e.g., Miami Trip" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input type="text" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className={inputClass} placeholder="Optional details..." />
              </div>
              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition">
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Your Groups</h1>
          <p className="text-slate-400 text-sm mt-0.5">Organized pooling ecosystems.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search groups..." className={`${inputClass} pl-10 py-2.5 m-0`} />
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <div className={`${glassClass} col-span-full p-8 text-center text-slate-400`}>
            No groups found. Create one to get started.
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} className={`${glassClass} p-6 flex flex-col justify-between cursor-pointer hover:border-white/[0.15] transition-all duration-300 group min-h-[160px]`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl font-bold uppercase text-indigo-400 group-hover:scale-105 transition-transform">
                    {group.name.substring(0,2)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-indigo-400 transition text-base">{group.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[120px]">{group.description || 'No description'}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4">
                <span className="text-xs text-slate-400">Created On</span>
                <span className="text-sm text-slate-300">{new Date(group.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
