import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Terminal, ShieldAlert } from 'lucide-react';
import type { ChatMessage } from '../../store/useStore';

/**
 * Renders basic markdown-like formatting:
 * - **bold** text
 * - `inline code`
 * - ```code blocks```
 * - Newlines as <br/>
 */
function renderMarkdown(text: string) {
  // Split by code blocks first
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'codeblock'; content: string; lang?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'codeblock', content: match[2].trim(), lang: match[1] || undefined });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.map((part, i) => {
    if (part.type === 'codeblock') {
      return (
        <pre key={i} className="bg-black/50 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto">
          <code className="text-xs font-mono text-sentinel-cyan">{part.content}</code>
        </pre>
      );
    }

    // For text parts, handle inline formatting
    return <span key={i}>{renderInlineMarkdown(part.content)}</span>;
  });
}

function renderInlineMarkdown(text: string) {
  // Split by lines first for line break handling
  const lines = text.split('\n');
  
  return lines.map((line, lineIdx) => {
    const elements: React.ReactNode[] = [];

    // Process **bold** and `inline code`
    const inlineRegex = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
    let lastIdx = 0;
    let inlineMatch;
    
    while ((inlineMatch = inlineRegex.exec(line)) !== null) {
      // Push text before the match
      if (inlineMatch.index > lastIdx) {
        elements.push(line.slice(lastIdx, inlineMatch.index));
      }
      
      if (inlineMatch[2]) {
        // Bold
        elements.push(<strong key={`b-${lineIdx}-${inlineMatch.index}`} className="text-white font-semibold">{inlineMatch[2]}</strong>);
      } else if (inlineMatch[4]) {
        // Inline code
        elements.push(
          <code key={`c-${lineIdx}-${inlineMatch.index}`} className="bg-white/10 text-sentinel-cyan px-1.5 py-0.5 rounded text-xs font-mono">
            {inlineMatch[4]}
          </code>
        );
      }
      
      lastIdx = inlineMatch.index + inlineMatch[0].length;
    }
    
    // Push remaining text
    if (lastIdx < line.length) {
      elements.push(line.slice(lastIdx));
    }
    
    // Add line break between lines (not after the last line)
    if (lineIdx < lines.length - 1) {
      elements.push(<br key={`br-${lineIdx}`} />);
    }

    return elements;
  });
}

export default function ChatCard({ message }: { message: ChatMessage }) {
  const [showJson, setShowJson] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-3xl glass-panel rounded-xl rounded-tr-sm p-4 border-sentinel-cyan/30 border">
          <div className="flex items-center gap-2 mb-2 text-sentinel-cyan">
            <Terminal size={14} />
            <span className="text-xs font-mono uppercase tracking-widest">User Query</span>
          </div>
          <p className="text-white text-lg">{message.content}</p>
        </div>
      </div>
    );
  }

  const isThreat = message.riskLevel === 'CRITICAL' || message.riskLevel === 'HIGH';

  return (
    <div className="mb-8">
      <div className={`max-w-4xl glass-panel rounded-xl rounded-tl-sm overflow-hidden border ${
        isThreat ? 'border-sentinel-red/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-sentinel-emerald/30'
      }`}>
        {/* Header */}
        <div className={`px-4 py-2 border-b flex items-center justify-between ${
          isThreat ? 'bg-sentinel-red/10 border-sentinel-red/20 text-sentinel-red' : 'bg-sentinel-emerald/5 border-sentinel-emerald/20 text-sentinel-emerald'
        }`}>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold">
            {isThreat ? <ShieldAlert size={16} className="animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-sentinel-emerald" />}
            {isThreat ? 'Threat Neutralized' : 'Secure Response Generated'}
          </div>
          <span className="text-[10px] opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-gray-300 leading-relaxed text-[15px]">
              {renderMarkdown(message.content)}
            </div>
          </div>

          {/* JSON Inspector */}
          {message.jsonRaw && (
            <div className="mt-4 border border-white/10 rounded-lg overflow-hidden bg-black/40">
              <button 
                onClick={() => setShowJson(!showJson)}
                className="w-full px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {showJson ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>RAW_ANALYSIS.json</span>
                </div>
                <Copy size={14} className="hover:text-sentinel-cyan cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(message.jsonRaw!);
                }} />
              </button>
              
              {showJson && (
                <div className="p-4 overflow-x-auto border-t border-white/10">
                  <pre className="text-xs font-mono text-sentinel-cyan">
                    <code>{message.jsonRaw}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
