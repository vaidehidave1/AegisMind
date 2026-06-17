import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function InsightPanel() {
  const { messages, stats } = useStore();

  // Find the last assistant message (which has intent/risk data)
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <aside className="w-80 h-screen border-l border-sentinel-border bg-sentinel-navy hidden lg:flex flex-col">
      <div className="p-4 border-b border-sentinel-border flex items-center gap-2">
        <Activity className="text-sentinel-cyan animate-pulse" size={18} />
        <h2 className="font-heading font-semibold text-white tracking-wide uppercase">Security Insight</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Session Stats */}
        <div>
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Session Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-3 rounded-lg border border-sentinel-emerald/20 bg-sentinel-emerald/5">
              <p className="text-[10px] text-sentinel-emerald font-mono mb-1">SAFE QUERIES</p>
              <p className="text-2xl font-bold text-white">{stats.safeQueries}</p>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-sentinel-red/20 bg-sentinel-red/5">
              <p className="text-[10px] text-sentinel-red font-mono mb-1">BLOCKED</p>
              <p className="text-2xl font-bold text-white">{stats.blockedAttempts}</p>
            </div>
          </div>
        </div>

        {/* Live Analysis (Last Assistant Message — shows intent/risk data) */}
        {lastAssistantMsg && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Cpu size={14} /> Live Analysis
            </h3>
            
            <div className="glass-panel rounded-xl p-4 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sentinel-cyan to-transparent opacity-50"></div>
              
              <div>
                <p className="text-[10px] text-gray-400 mb-1">INTENT</p>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-sm inline-block">
                  {lastAssistantMsg.intent || 'General Inquiry'}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1">RISK LEVEL</p>
                <div className={`px-2 py-1 rounded border text-sm inline-flex items-center gap-1 font-bold ${
                  lastAssistantMsg.riskLevel === 'CRITICAL' ? 'bg-sentinel-red/20 text-sentinel-red border-sentinel-red/50 animate-pulse' :
                  lastAssistantMsg.riskLevel === 'HIGH' ? 'bg-sentinel-amber/20 text-sentinel-amber border-sentinel-amber/50' :
                  lastAssistantMsg.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                  'bg-sentinel-emerald/20 text-sentinel-emerald border-sentinel-emerald/50'
                }`}>
                  {lastAssistantMsg.riskLevel === 'CRITICAL' && <ShieldAlert size={14} />}
                  {lastAssistantMsg.riskLevel || 'LOW'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
