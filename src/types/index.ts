export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  splitflow_id: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: Profile; // Joined data
}

export interface Expense {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  receipt_url: string | null;
  split_type: 'equal' | 'exact' | 'percentage' | 'shares';
  created_at: string;
  paid_by_profile?: Profile; // Joined data
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  user_profile?: Profile; // Joined data
}

export interface Settlement {
  id: string;
  group_id: string;
  paid_by: string;
  paid_to: string;
  amount: number;
  created_at: string;
  paid_by_profile?: Profile;
  paid_to_profile?: Profile;
}
