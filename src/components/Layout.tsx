import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { glassClass } from '../lib/utils';
import { LayoutDashboard, Users, Receipt, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Add Expense', path: '/add-expense', icon: Receipt },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/0 blur-[120px]"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-emerald-500/10 to-cyan-500/0 blur-[120px]"></div>
      </div>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className={`${glassClass} hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 p-6 rounded-[24px] overflow-y-auto`}>
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm tracking-tighter text-white shadow-md shadow-indigo-500/10">SF</div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Splitzy</span>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-white/[0.08] text-white border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div 
            className="mt-auto border-t border-white/[0.06] pt-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
            onClick={() => navigate('/profile')}
          >
            <img 
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" 
            />
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</h4>
              <p className="text-xs text-slate-500 truncate">{profile?.splitflow_id || 'SPF-...'}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleSignOut(); }} className="text-slate-400 hover:text-rose-400 p-1 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className={`${glassClass} md:hidden sticky top-0 z-40 flex items-center justify-between px-6 py-4 rounded-none border-t-0 border-x-0 bg-slate-950/80 backdrop-blur-xl`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs tracking-tighter text-white">SF</div>
            <span className="font-semibold text-base tracking-tight text-white">Splitzy</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="focus:outline-none">
              <img 
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-white/20" 
              />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className={`${glassClass} md:hidden fixed bottom-4 left-4 right-4 z-40 p-2 rounded-2xl bg-slate-900/60 backdrop-blur-lg flex justify-around items-center border border-white/[0.08] shadow-2xl`}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                  isActive ? 'text-indigo-400 bg-white/[0.06]' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
