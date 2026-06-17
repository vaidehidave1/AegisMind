import { Shield, MessageSquare, AlertTriangle, FileText, BarChart2, BookOpen, Settings, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { icon: MessageSquare, label: 'Chat' as const },
  { icon: AlertTriangle, label: 'Threat Center' as const },
  { icon: FileText, label: 'Prompt Logs' as const },
  { icon: BarChart2, label: 'Analytics' as const },
  { icon: BookOpen, label: 'Documentation' as const },
  { icon: Settings, label: 'Settings' as const },
  { icon: Users, label: 'Admin' as const },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, systemStatus, currentUser, setCurrentUser } = useStore();

  return (
    <aside className="w-64 h-screen border-r border-sentinel-border bg-sentinel-navy flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center bg-sentinel-cyan/10 rounded-xl border border-sentinel-cyan/30 text-sentinel-cyan animate-pulse-slow">
          <Shield size={24} />
          <div className="absolute inset-0 bg-sentinel-cyan opacity-20 blur-md rounded-xl"></div>
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-wider">SENTINEL</h1>
          <p className="text-[10px] text-sentinel-cyan font-mono uppercase tracking-widest">Secure AI Assistant</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-sentinel-cyan/10 text-sentinel-cyan border border-sentinel-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sentinel-border flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full border border-sentinel-cyan/30 overflow-hidden flex items-center justify-center bg-black/40">
            {currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-sentinel-cyan text-sm font-mono uppercase font-bold">
                {currentUser?.username.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser?.username}</p>
            <p className="text-[10px] text-gray-500 font-mono truncate">USER ROLE</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">System Status</span>
          {systemStatus === 'SECURE' ? (
            <div className="flex items-center gap-1.5 text-sentinel-emerald text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-sentinel-emerald animate-pulse"></div>
              <span className="font-bold tracking-wider">SECURE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sentinel-red text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-sentinel-red animate-ping"></div>
              <span className="font-bold tracking-wider animate-pulse">THREAT DETECTED</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="w-full py-2 border border-white/10 hover:border-sentinel-red/30 bg-white/5 hover:bg-sentinel-red/10 text-gray-400 hover:text-sentinel-red rounded-lg transition-all text-xs font-mono font-bold tracking-wide"
        >
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}
