import { ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ThreatCenter() {
  const { messages, stats, systemStatus, setSystemStatus } = useStore();
  
  // Filter messages that have high or critical risk levels
  const threatMessages = messages.filter(
    (msg) => msg.role === 'assistant' && (msg.riskLevel === 'CRITICAL' || msg.riskLevel === 'HIGH')
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">THREAT CENTER</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-red/30 text-sentinel-red bg-sentinel-red/10 animate-pulse">MONITORING ACTIVE</span>
        </div>
        <button 
          onClick={() => setSystemStatus('SECURE')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10 hover:bg-sentinel-cyan/20 text-sentinel-cyan transition-colors text-xs font-mono"
        >
          <RefreshCw size={12} /> RESET ALERTS
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Status Card */}
        <div className={`glass-panel p-6 rounded-2xl border ${
          systemStatus === 'SECURE' ? 'border-sentinel-emerald/30' : 'border-sentinel-red/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              systemStatus === 'SECURE' ? 'bg-sentinel-emerald/10 text-sentinel-emerald' : 'bg-sentinel-red/10 text-sentinel-red animate-bounce'
            }`}>
              {systemStatus === 'SECURE' ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                SYSTEM STATUS: {systemStatus}
              </h3>
              <p className="text-sm text-gray-400">
                {systemStatus === 'SECURE' 
                  ? 'All security guardrails are operating normally. No active threats detected.' 
                  : 'An adversarial prompt injection or policy-violating request was intercepted.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">PROMPT INJECTIONS BLOCKED</p>
            <p className="text-3xl font-bold text-sentinel-cyan">{stats.injectionAttempts}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">UNSAFE REQUESTS BLOCKED</p>
            <p className="text-3xl font-bold text-sentinel-amber">{stats.blockedAttempts}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">TOTAL SAFE OPERATIONS</p>
            <p className="text-3xl font-bold text-sentinel-emerald">{stats.safeQueries}</p>
          </div>
        </div>

        {/* Threat List */}
        <div>
          <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-3">Intercepted Security Events</h3>
          {threatMessages.length === 0 ? (
            <div className="glass-panel p-8 rounded-xl text-center border border-white/5">
              <ShieldCheck size={40} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400 text-sm font-mono">NO SECURITY EVENTS LOGGED IN THIS SESSION</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threatMessages.map((msg) => (
                <div key={msg.id} className="glass-panel p-4 rounded-xl border border-sentinel-red/20 bg-sentinel-red/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-sentinel-red" size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sentinel-red uppercase bg-sentinel-red/10 px-2 py-0.5 rounded">
                          {msg.riskLevel} Risk
                        </span>
                        <span className="text-xs font-mono text-sentinel-cyan">
                          Classified Intent: {msg.intent}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-1">{msg.content}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
