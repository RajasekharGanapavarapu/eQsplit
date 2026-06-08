import { supabase } from './supabase';

export const api = {
  async getGroups(userId: string) {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', userId);
      
    if (error) throw error;
    // return groups with member count
    const groups = data.map((d: any) => d.groups);
    return groups;
  },

  async createGroup(name: string, description: string, createdBy: string) {
    // 1. Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, description, created_by: createdBy })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Add owner to group_members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: createdBy, role: 'owner' });

    if (memberError) throw memberError;

    return group;
  },

  async getGroupDetails(groupId: string) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    if (error) throw error;
    return data;
  },

  async getGroupMembers(groupId: string) {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', groupId);
    if (error) throw error;
    return data;
  },

  async inviteMemberBySpfId(groupId: string, spfId: string) {
    // Look up user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('splitflow_id', spfId)
      .single();
      
    if (profileError || !profile) throw new Error('User not found with this Splitzy ID');

    // Add to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: profile.id, role: 'member' });

    if (memberError) {
      if (memberError.code === '23505') throw new Error('User is already in this group');
      throw memberError;
    }
    
    return true;
  },

  async getExpenses(groupId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, paid_by_profile:profiles!expenses_paid_by_fkey(*)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async getExpenseSplits(expenseId: string) {
    const { data, error } = await supabase
      .from('expense_splits')
      .select('*, user_profile:profiles(*)')
      .eq('expense_id', expenseId);
    if (error) throw error;
    return data;
  },
  
  async getUserBalances(userId: string) {
    // 1. Get expenses paid by the user
    const { data: expensesPaidByMe, error: e1 } = await supabase
      .from('expenses')
      .select('id, amount, expense_splits(user_id, amount)')
      .eq('paid_by', userId);
      
    // 2. Get splits where user owes someone else
    const { data: splitsOwedByMe, error: e2 } = await supabase
      .from('expense_splits')
      .select('amount, expenses!inner(paid_by)')
      .eq('user_id', userId)
      .neq('expenses.paid_by', userId);

    // 3. Get settlements where user paid someone
    const { data: settlementsPaid, error: e3 } = await supabase
      .from('settlements')
      .select('amount, payee_id')
      .eq('payer_id', userId);

    // 4. Get settlements where user received money
    const { data: settlementsReceived, error: e4 } = await supabase
      .from('settlements')
      .select('amount, payer_id')
      .eq('payee_id', userId);
      
    if (e1 || e2 || e3 || e4) throw new Error('Failed to load balances');
    
    let owesYou = 0;
    let youOwe = 0;
    
    // Calculate Owes You (gross)
    expensesPaidByMe?.forEach((expense: any) => {
      expense.expense_splits?.forEach((split: any) => {
        if (split.user_id !== userId) {
          owesYou += Number(split.amount);
        }
      });
    });
    
    // Deduct what they already paid you
    settlementsReceived?.forEach((settlement: any) => {
      owesYou -= Number(settlement.amount);
    });

    // Calculate You Owe (gross)
    splitsOwedByMe?.forEach((split: any) => {
      youOwe += Number(split.amount);
    });

    // Deduct what you already paid them
    settlementsPaid?.forEach((settlement: any) => {
      youOwe -= Number(settlement.amount);
    });

    // Prevent negative balances due to overpayment edge cases (optional, but good UX)
    owesYou = Math.max(0, owesYou);
    youOwe = Math.max(0, youOwe);
    
    return {
      owesYou,
      youOwe,
      netBalance: owesYou - youOwe
    };
  },

  async createExpense(
    groupId: string,
    paidBy: string,
    title: string,
    amount: number,
    splitType: 'equal' | 'percentage' | 'exact',
    splits: { userId: string, amount: number }[],
    receiptFile?: File
  ) {
    let receiptUrl = null;
    
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${groupId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
      receiptUrl = data.publicUrl;
    }

    // Insert expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        paid_by: paidBy,
        title,
        amount,
        split_type: splitType,
        receipt_url: receiptUrl
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Insert splits
    const splitInserts = splits.map(s => ({
      expense_id: expense.id,
      user_id: s.userId,
      amount: s.amount
    }));

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitInserts);

    if (splitsError) throw splitsError;

    return expense;
  },

  async addSettlement(groupId: string, payerId: string, payeeId: string, amount: number) {
    const { data, error } = await supabase
      .from('settlements')
      .insert({
        group_id: groupId,
        payer_id: payerId,
        payee_id: payeeId,
        amount
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(groupId: string, userId: string) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateProfile(userId: string, name: string, avatarUrl: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ name, avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
