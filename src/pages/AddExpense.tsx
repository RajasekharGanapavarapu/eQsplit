import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { ChevronLeft, Receipt, Users, Upload, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function AddExpense() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage'>('equal');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  // Custom split tracking: mapping user_id to amount or percentage
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) loadGroupMembers(selectedGroup);
  }, [selectedGroup]);

  // Reset custom splits when split type or members change
  useEffect(() => {
    const initialSplits: Record<string, string> = {};
    members.forEach(m => {
      initialSplits[m.user_id] = '';
    });
    setCustomSplits(initialSplits);
  }, [splitType, members]);

  const loadGroups = async () => {
    try {
      const g = await api.getGroups(user!.id);
      setGroups(g);
      if (g.length > 0) setSelectedGroup(g[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const m = await api.getGroupMembers(groupId);
      setMembers(m);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSplitChange = (userId: string, val: string) => {
    setCustomSplits(prev => ({ ...prev, [userId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !selectedGroup) return alert('Please fill in all required fields');
    if (members.length === 0) return alert('No members in this group');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return alert('Please enter a valid amount');

    let finalSplits: { userId: string, amount: number }[] = [];

    if (splitType === 'equal') {
      const splitAmount = numAmount / members.length;
      finalSplits = members.map(m => ({
        userId: m.user_id,
        amount: splitAmount
      }));
    } else if (splitType === 'exact') {
      let sum = 0;
      finalSplits = members.map(m => {
        const val = parseFloat(customSplits[m.user_id]) || 0;
        sum += val;
        return { userId: m.user_id, amount: val };
      });
      // Allow a tiny margin for floating point errors (1 cent)
      if (Math.abs(sum - numAmount) > 0.01) {
        return alert(`Exact splits must sum to the total amount (₹${numAmount.toFixed(2)}). Current sum is ₹${sum.toFixed(2)}.`);
      }
    } else if (splitType === 'percentage') {
      let percentSum = 0;
      finalSplits = members.map(m => {
        const pct = parseFloat(customSplits[m.user_id]) || 0;
        percentSum += pct;
        return { userId: m.user_id, amount: (pct / 100) * numAmount };
      });
      if (Math.abs(percentSum - 100) > 0.01) {
        return alert(`Percentages must sum to 100%. Current sum is ${percentSum}%.`);
      }
    }

    setIsSubmitting(true);
    try {
      await api.createExpense(
        selectedGroup,
        user!.id,
        description,
        numAmount,
        splitType,
        finalSplits,
        receiptFile || undefined
      );
      
      alert('Expense added!');
      navigate(`/groups/${selectedGroup}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEqualAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    return members.length > 0 ? (numAmount / members.length).toFixed(2) : '0.00';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="p-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-400 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Add New Expense</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`${glassClass} p-6 space-y-6`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Group</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  value={selectedGroup}
                  onChange={e => setSelectedGroup(e.target.value)}
                  className={`${inputClass} pl-10 appearance-none`}
                  required
                >
                  <option value="" disabled>Select a group...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g., Dinner at Mario's" 
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className={`${inputClass} pl-8 text-lg font-medium`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Split Type Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button type="button" onClick={() => setSplitType('equal')} className={`${glassClass} py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${splitType === 'equal' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'hover:bg-white/[0.04] text-slate-400 border-white/[0.08]'}`}>
            <span className="text-sm font-medium">Equally</span>
          </button>
          <button type="button" onClick={() => setSplitType('exact')} className={`${glassClass} py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${splitType === 'exact' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'hover:bg-white/[0.04] text-slate-400 border-white/[0.08]'}`}>
            <span className="text-sm font-medium">Exact</span>
          </button>
          <button type="button" onClick={() => setSplitType('percentage')} className={`${glassClass} py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${splitType === 'percentage' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'hover:bg-white/[0.04] text-slate-400 border-white/[0.08]'}`}>
            <span className="text-sm font-medium">Percentage</span>
          </button>
        </div>

        {/* Dynamic Split Details Section */}
        {members.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-slate-300">Split Details</h3>
              {splitType !== 'equal' && (
                <span className="text-xs text-slate-500">
                  {splitType === 'exact' ? 'Enter exact amounts' : 'Enter percentages'}
                </span>
              )}
            </div>
            
            <div className={`${glassClass} p-2 sm:p-4 space-y-2`}>
              {members.map(member => (
                <div key={member.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs text-white uppercase font-medium">
                      {member.profiles?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-slate-200">
                      {member.user_id === user?.id ? 'You' : member.profiles?.name}
                    </span>
                  </div>
                  
                  <div>
                    {splitType === 'equal' ? (
                      <span className="text-sm font-medium text-white px-2">₹{calculateEqualAmount()}</span>
                    ) : (
                      <div className="relative w-24">
                        {splitType === 'exact' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>}
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={customSplits[member.user_id] || ''}
                          onChange={(e) => handleCustomSplitChange(member.user_id, e.target.value)}
                          className={`${inputClass} text-right text-sm py-1.5 ${splitType === 'exact' ? 'pl-6' : 'pr-6'}`}
                        />
                        {splitType === 'percentage' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`${glassClass} p-5 border border-dashed border-white/[0.15] text-center rounded-xl hover:bg-white/[0.02] transition cursor-pointer relative overflow-hidden group`}>
          <input type="file" onChange={e => setReceiptFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{receiptFile ? receiptFile.name : 'Upload Receipt'}</p>
              <p className="text-xs text-slate-500 mt-0.5">{receiptFile ? 'Click to change' : 'JPG, PNG or PDF (max 5MB)'}</p>
            </div>
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-lg">
          {isSubmitting ? 'Processing...' : <><Check className="w-5 h-5" /> Save Expense</>}
        </button>
      </form>
    </div>
  );
}
