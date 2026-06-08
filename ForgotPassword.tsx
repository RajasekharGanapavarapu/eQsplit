import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { glassClass, inputClass } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 animate-fadeIn">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/0 blur-[120px]"></div>
      </div>

      <div className={`${glassClass} w-full max-w-md p-8 md:p-10 transform transition-all duration-500`}>
        <button onClick={() => navigate('/login')} className="p-2 mb-6 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-400 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Reset Password</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl text-center mb-6">
            Check your email for the password reset link! You can close this page.
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
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
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-500 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-70 mt-2"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
