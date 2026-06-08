import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/0 blur-[120px]"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-emerald-500/10 to-cyan-500/0 blur-[120px]"></div>
      </div>

      <div className={`${glassClass} w-full max-w-md p-8 md:p-10 transform transition-all duration-500 hover:border-white/[0.12]`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-4">
            <span className="text-xl font-bold tracking-tighter text-white">SF</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Experience effortless expense distribution.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className={inputClass} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={inputClass} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-950 font-medium py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-all duration-300 shadow-lg active:scale-[0.98] mt-2 text-sm disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Create one</Link>
        </div>
      </div>
    </div>
  );
}
