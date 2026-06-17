import { useStore } from '../../store/useStore';

export default function Analytics() {
  const { stats } = useStore();

  const totalQueries = stats.safeQueries + stats.blockedAttempts + stats.injectionAttempts;
  const safePercentage = totalQueries > 0 ? Math.round((stats.safeQueries / totalQueries) * 100) : 100;
  const blockedPercentage = totalQueries > 0 ? Math.round(((stats.blockedAttempts + stats.injectionAttempts) / totalQueries) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">SECURITY ANALYTICS</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-cyan/30 text-sentinel-cyan bg-sentinel-cyan/10">REAL-TIME TELEMETRY</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Core Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">TOTAL REQUESTS</span>
            <span className="text-3xl font-bold text-white">{totalQueries}</span>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-sentinel-emerald/20 bg-sentinel-emerald/5">
            <span className="text-[10px] font-mono text-sentinel-emerald uppercase tracking-widest block mb-1">CLEARED QUERIES</span>
            <span className="text-3xl font-bold text-white">{stats.safeQueries}</span>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-sentinel-amber/20 bg-sentinel-amber/5">
            <span className="text-[10px] font-mono text-sentinel-amber uppercase tracking-widest block mb-1">POLICY VIOLATIONS</span>
            <span className="text-3xl font-bold text-white">{stats.blockedAttempts}</span>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-sentinel-red/20 bg-sentinel-red/5">
            <span className="text-[10px] font-mono text-sentinel-red uppercase tracking-widest block mb-1">INJECTION ATTEMPTS</span>
            <span className="text-3xl font-bold text-white">{stats.injectionAttempts}</span>
          </div>
        </div>

        {/* Charts & Ratios */}
        <div className="grid grid-cols-2 gap-6">
          {/* Ratio Pie Chart (Simulated with premium custom SVG) */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase mb-1">Safety Ratio</h3>
              <p className="text-xs text-gray-400">Proportion of safe transactions versus intercepted hazards.</p>
            </div>
            
            <div className="flex items-center justify-around py-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                  {totalQueries > 0 ? (
                    <>
                      {/* Safe Queries Circle */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                              strokeDasharray={`${safePercentage * 2.51} 251`} />
                      {/* Blocked Queries Circle */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12"
                              strokeDasharray={`${blockedPercentage * 2.51} 251`}
                              strokeDashoffset={`-${safePercentage * 2.51}`} />
                    </>
                  ) : (
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#00f0ff" strokeWidth="12"
                            strokeDasharray="251" />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">
                    {totalQueries > 0 ? `${safePercentage}%` : '100%'}
                  </span>
                  <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">SAFE RATE</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-sentinel-emerald"></div>
                  <span className="text-gray-300">Safe ({safePercentage}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-sentinel-red"></div>
                  <span className="text-gray-300">Violated ({blockedPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline / Classification */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase mb-1">Threat Classification</h3>
              <p className="text-xs text-gray-400">Breakdown of security intercepts by specific classification intent.</p>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300">Prompt Injection</span>
                  <span className="text-sentinel-cyan">{stats.injectionAttempts}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sentinel-cyan rounded-full transition-all duration-500" style={{ width: `${totalQueries > 0 ? (stats.injectionAttempts / totalQueries) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300">Unsafe Request</span>
                  <span className="text-sentinel-amber">{stats.blockedAttempts}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sentinel-amber rounded-full transition-all duration-500" style={{ width: `${totalQueries > 0 ? (stats.blockedAttempts / totalQueries) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300">Safe/Normal Query</span>
                  <span className="text-sentinel-emerald">{stats.safeQueries}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sentinel-emerald rounded-full transition-all duration-500" style={{ width: `${totalQueries > 0 ? (stats.safeQueries / totalQueries) * 100 : 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
