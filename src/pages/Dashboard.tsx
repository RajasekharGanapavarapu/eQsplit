import { useEffect, useState } from 'react';
import { glassClass, inputClass } from '../lib/utils';
import { Wallet, Users, ArrowUpRight, ArrowDownRight, RefreshCcw, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [balances, setBalances] = useState({ netBalance: 0, owesYou: 0, youOwe: 0 });
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settle Up Modal State
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [selectedGroupToSettle, setSelectedGroupToSettle] = useState('');
  const [selectedPayee, setSelectedPayee] = useState('');
  const [groupMembersForSettle, setGroupMembersForSettle] = useState<any[]>([]);
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroupToSettle) {
      api.getGroupMembers(selectedGroupToSettle).then(setGroupMembersForSettle);
    } else {
      setGroupMembersForSettle([]);
    }
  }, [selectedGroupToSettle]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [b, g] = await Promise.all([
        api.getUserBalances(user!.id),
        api.getGroups(user!.id)
      ]);
      setBalances(b);
      setGroups(g);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupToSettle || !selectedPayee || !settleAmount) return alert('Please fill in all fields');
    
    setIsSettling(true);
    try {
      await api.addSettlement(selectedGroupToSettle, user!.id, selectedPayee, parseFloat(settleAmount));
      alert('Settlement recorded successfully!');
      setShowSettleModal(false);
      setSettleAmount('');
      setSelectedGroupToSettle('');
      setSelectedPayee('');
      loadData(); // Refresh balances
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to record settlement');
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn relative">
      {/* Settle Up Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`${glassClass} w-full max-w-md p-6 relative`}>
            <button onClick={() => setShowSettleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-6">Settle Up</h2>
            <form onSubmit={handleSettleUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Select Group</label>
                <select required value={selectedGroupToSettle} onChange={e => setSelectedGroupToSettle(e.target.value)} className={inputClass}>
                  <option value="" disabled>Choose a group...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>
                  ))}
                </select>
              </div>
              
              {selectedGroupToSettle && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Who are you paying?</label>
                  <select required value={selectedPayee} onChange={e => setSelectedPayee(e.target.value)} className={inputClass}>
                    <option value="" disabled>Choose a member...</option>
                    {groupMembersForSettle.filter(m => m.user_id !== user?.id).map(m => (
                      <option key={m.user_id} value={m.user_id} className="bg-slate-900">{m.profiles?.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Amount Paid</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input type="number" step="0.01" min="0.01" required value={settleAmount} onChange={e => setSettleAmount(e.target.value)} className={`${inputClass} pl-8`} placeholder="0.00" />
                </div>
              </div>

              <button disabled={isSettling} type="submit" className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2">
                {isSettling ? 'Processing...' : <><Check className="w-5 h-5" /> Record Payment</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your financial ecosystem status.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettleModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Settle Up</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${glassClass} p-5 rounded-2xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400">Total Net Balance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${balances.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {balances.netBalance >= 0 ? '+' : '-'}₹{Math.abs(balances.netBalance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className={`${glassClass} p-5 rounded-2xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-16 h-16 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">Owes You</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">₹{balances.owesYou.toFixed(2)}</span>
          </div>
        </div>

        <div className={`${glassClass} p-5 rounded-2xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-16 h-16 text-rose-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">You Owe</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">₹{balances.youOwe.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Active Ecosystems</h2>
          <button onClick={() => navigate('/groups')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View all</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.length === 0 ? (
            <div className={`${glassClass} p-6 rounded-2xl col-span-2 text-center`}>
              <p className="text-slate-400 mb-4">You aren't part of any groups yet.</p>
              <button onClick={() => navigate('/groups')} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                Create a Group
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} className={`${glassClass} p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition group border border-transparent hover:border-white/[0.08]`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg uppercase">
                    {group.name.charAt(0)}
                  </div>
                  <Users className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-white tracking-tight">{group.name}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{group.description || 'No description'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
