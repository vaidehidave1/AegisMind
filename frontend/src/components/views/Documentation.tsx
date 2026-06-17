import { ShieldCheck, Lock, Terminal, ShieldAlert } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">DOCUMENTATION</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-cyan/30 text-sentinel-cyan bg-sentinel-cyan/10">REFERENCE GUIDE</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-heading font-bold text-white tracking-wide mb-2 uppercase">Overview</h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            Sentinel AI is a secure reverse proxy and filtering firewall for Large Language Models.
            It wraps standard chat workflows in a multi-step inspection pipeline that evaluates incoming payloads for adversarial manipulation, prompt injection, and credential leakage before the model can generate a token.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sentinel-cyan">
              <Terminal size={18} />
              <h4 className="font-heading font-semibold text-white">1. Input Ingestion</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every request is normalized. Markdown formatting, hex formatting, Unicode character escapes, and multi-byte representations are flattened to prevent prompt evasion tricks.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sentinel-amber">
              <ShieldAlert size={18} />
              <h4 className="font-heading font-semibold text-white">2. Prompt Injection (PI) Check</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Regex patterns and semantic embeddings parse the query for instructional overrides (e.g. "ignore previous instructions", "system prompt reveal") and isolate the attack vector.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-yellow-500">
              <Lock size={18} />
              <h4 className="font-heading font-semibold text-white">3. Data Loss Prevention (DLP)</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Parses requests for potential enterprise policy violations, including password requests, cryptographic secrets, database credentials, or system access keys.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sentinel-emerald">
              <ShieldCheck size={18} />
              <h4 className="font-heading font-semibold text-white">4. Output Verification</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Validates that the generated assistant response aligns with the requested safety metrics and does not contain leakage of pre-system prompt directives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
