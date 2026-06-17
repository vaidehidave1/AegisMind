import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Users, Activity, ShieldAlert, MessageSquare, ShieldCheck, RefreshCw } from 'lucide-react';

interface UserActivity {
  username: string;
  profilePic: string;
  messageCount: number;
  risks: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

interface AdminData {
  totalUsers: number;
  totalMessages: number;
  globalRisks: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  users: UserActivity[];
}

export default function Admin() {
  const { currentUser } = useStore();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      } else {
        setError('Failed to fetch admin stats');
      }
    } catch {
      setError('Connection failure to API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-sentinel-black text-sentinel-cyan font-mono text-sm">
        <RefreshCw className="animate-spin mr-2" size={18} /> LOADING SYSTEM AUDIT...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-sentinel-black text-sentinel-red font-mono text-sm">
        ERROR: {error || 'No administrative payload available.'}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-sentinel-cyan" size={20} />
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">ADMIN PANEL</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-cyan/30 text-sentinel-cyan bg-sentinel-cyan/10">USER TELEMETRY</span>
        </div>
        <button onClick={fetchStats} className="p-2 border border-white/10 hover:border-sentinel-cyan/50 rounded-lg text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Core Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{data.totalUsers}</h3>
            </div>
            <Users className="text-sentinel-cyan" size={28} />
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Logged Messages</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{data.totalMessages}</h3>
            </div>
            <MessageSquare className="text-sentinel-cyan" size={28} />
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Critical Threats Evasion</p>
              <h3 className="text-2xl font-bold mt-1 text-sentinel-red">{data.globalRisks.CRITICAL}</h3>
            </div>
            <ShieldAlert className="text-sentinel-red" size={28} />
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Safe Requests Processed</p>
              <h3 className="text-2xl font-bold mt-1 text-sentinel-emerald">{data.globalRisks.LOW}</h3>
            </div>
            <ShieldCheck className="text-sentinel-emerald" size={28} />
          </div>
        </div>

        {/* User Breakdown Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <h3 className="font-heading font-semibold text-white">Registered Users & Security Audit</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-mono text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Total Activity</th>
                  <th className="px-6 py-3 text-sentinel-emerald">Safe (Low)</th>
                  <th className="px-6 py-3 text-sentinel-red">Violations (High/Critical)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.users.map((user) => (
                  <tr key={user.username} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-sentinel-cyan/30 flex items-center justify-center bg-black/40">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sentinel-cyan text-xs font-bold">{user.username.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-mono">{user.messageCount} interactions</td>
                    <td className="px-6 py-4 text-sentinel-emerald font-mono">{user.risks.LOW}</td>
                    <td className="px-6 py-4 text-sentinel-red font-mono">
                      {user.risks.HIGH + user.risks.CRITICAL}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
