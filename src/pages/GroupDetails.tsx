import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { ChevronLeft, Paperclip, UserPlus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function GroupDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showInvite, setShowInvite] = useState(false);
  const [spfId, setSpfId] = useState('');

  useEffect(() => {
    if (id) loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [gData, mData, eData] = await Promise.all([
        api.getGroupDetails(id!),
        api.getGroupMembers(id!),
        api.getExpenses(id!)
      ]);
      setGroup(gData);
      setMembers(mData);
      setExpenses(eData);
    } catch (error) {
      console.error(error);
      alert('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inviteMemberBySpfId(id!, spfId.trim().toUpperCase());
      alert('Member added successfully!');
      setShowInvite(false);
      setSpfId('');
      loadGroupData();
    } catch (error: any) {
      alert(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.removeMember(id!, userId);
      loadGroupData();
    } catch (error: any) {
      alert(error.message || 'Failed to remove member');
    }
  };

  if (loading || !group) return <div className="p-8">Loading group...</div>;

  // Simple stats calculation
  const totalSpend = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const isOwner = group.created_by === user?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn relative">
      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`${glassClass} w-full max-w-md p-6 relative`}>
            <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-4">Invite Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Splitzy ID</label>
                <input type="text" required value={spfId} onChange={e => setSpfId(e.target.value)} className={inputClass} placeholder="SPF-XXXXXX" />
                <p className="text-[11px] text-slate-500 mt-2">Ask your friend for their Splitzy ID located on their Profile page.</p>
              </div>
              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition">
                Add to Group
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/groups')} className="p-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Group Blueprint</span>
            <h1 className="text-2xl font-semibold text-white tracking-tight">{group.name}</h1>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} className="bg-white/[0.08] hover:bg-white/[0.12] text-white px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`${glassClass} p-4 rounded-xl text-center`}>
          <span className="text-xs text-slate-500 block">Total Group Spend</span>
          <span className="text-lg font-semibold text-white mt-1 block">₹{totalSpend.toFixed(2)}</span>
        </div>
        <div className={`${glassClass} p-4 rounded-xl text-center`}>
          <span className="text-xs text-slate-500 block">Members</span>
          <span className="text-lg font-semibold text-white mt-1 block">{members.length}</span>
        </div>
        <div className={`${glassClass} p-4 rounded-xl text-center`}>
          <span className="text-xs text-slate-500 block">Owed to You</span>
          <span className="text-lg font-semibold text-emerald-400 mt-1 block">---</span>
        </div>
        <div className={`${glassClass} p-4 rounded-xl text-center`}>
          <span className="text-xs text-slate-500 block">Total Bills</span>
          <span className="text-lg font-semibold text-purple-400 mt-1 block">{expenses.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content: Expense Ledger */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-white">Expense History Ledger</h3>
            <button onClick={() => navigate('/add-expense')} className="text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition">
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className={`${glassClass} p-8 text-center text-slate-400`}>No expenses yet. Add one!</div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className={`${glassClass} p-4 flex items-center justify-between hover:border-white/[0.12] transition duration-300`}>
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-lg uppercase font-bold text-slate-300">
                      {expense.title.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-white truncate text-sm">{expense.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">Paid by <span className="text-slate-300 font-medium">{expense.paid_by_profile?.name || 'Unknown'}</span> • {new Date(expense.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">₹{Number(expense.amount).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block capitalize">Split: {expense.split_type}</span>
                    </div>
                    {expense.receipt_url && (
                      <a href={expense.receipt_url} target="_blank" rel="noreferrer" title="View Receipt Attachment" className="p-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-indigo-400 border border-white/[0.06] rounded-lg transition">
                        <Paperclip className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Group Members */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-white">Ecosystem Members</h3>
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className={`${glassClass} p-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs text-white uppercase font-medium">
                    {member.profiles?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{member.profiles?.name}</p>
                    {member.role === 'owner' && <span className="text-[10px] text-indigo-400 font-medium">Owner</span>}
                  </div>
                </div>
                {isOwner && member.user_id !== user?.id && (
                  <button onClick={() => handleRemoveMember(member.user_id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded-lg transition">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
