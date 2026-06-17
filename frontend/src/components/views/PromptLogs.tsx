import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Terminal, ChevronDown, ChevronRight } from 'lucide-react';

export default function PromptLogs() {
  const { messages } = useStore();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Get only user messages and assistant responses in a paired or chronological list
  const userMessages = messages.filter((msg) => msg.role === 'user');

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">PROMPT LOGS</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-cyan/30 text-sentinel-cyan bg-sentinel-cyan/10">SECURE LOGGING AUDIT</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {userMessages.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center border border-white/5">
            <Terminal size={40} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm font-mono">NO PROMPTS LOGGED YET</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userMessages.map((usrMsg) => {
              // Find the corresponding response
              const responseIndex = messages.findIndex((m) => m.id === usrMsg.id) + 1;
              const respMsg = responseIndex < messages.length ? messages[responseIndex] : null;
              const isExpanded = expandedLog === usrMsg.id;

              return (
                <div 
                  key={usrMsg.id}
                  className="glass-panel rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-sentinel-cyan/30"
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedLog(isExpanded ? null : usrMsg.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {isExpanded ? <ChevronDown size={18} className="text-sentinel-cyan" /> : <ChevronRight size={18} className="text-gray-400" />}
                      <span className="text-xs font-mono text-gray-500 shrink-0">
                        {usrMsg.timestamp.toLocaleTimeString()}
                      </span>
                      <p className="text-sm font-medium text-white truncate max-w-md">
                        {usrMsg.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {respMsg && (
                        <>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            respMsg.riskLevel === 'CRITICAL' ? 'border-sentinel-red/30 text-sentinel-red bg-sentinel-red/10' :
                            respMsg.riskLevel === 'HIGH' ? 'border-sentinel-amber/30 text-sentinel-amber bg-sentinel-amber/10' :
                            'border-sentinel-emerald/30 text-sentinel-emerald bg-sentinel-emerald/10'
                          }`}>
                            {respMsg.riskLevel || 'LOW'} RISK
                          </span>
                          <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                            {respMsg.intent || 'General'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details view */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/5 bg-black/20 space-y-4">
                      <div>
                        <h4 className="text-xs font-mono text-sentinel-cyan uppercase tracking-wider mb-2">Original Prompt</h4>
                        <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10 font-mono">
                          {usrMsg.content}
                        </p>
                      </div>

                      {respMsg && (
                        <>
                          <div>
                            <h4 className="text-xs font-mono text-sentinel-emerald uppercase tracking-wider mb-2">Sentinel Response</h4>
                            <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10">
                              {respMsg.content}
                            </p>
                          </div>

                          {respMsg.jsonRaw && (
                            <div>
                              <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">RAW_ANALYSIS.json</h4>
                              <pre className="text-[11px] font-mono text-sentinel-cyan bg-black/40 p-3 rounded-lg overflow-x-auto border border-white/5">
                                <code>{respMsg.jsonRaw}</code>
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
