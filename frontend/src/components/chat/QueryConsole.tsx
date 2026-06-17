import React, { useState, useEffect } from 'react';
import { Send, Mic, Paperclip, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { API_BASE_URL } from '../../lib/api';

export default function QueryConsole() {
  const [input, setInput] = useState('');
  const { 
    isProcessing, setProcessing, addMessage, clearMessages, 
    setWorkflowStep, setSystemStatus, geminiApiKey, groqApiKey,
    pendingPrompt, setPendingPrompt, currentUser
  } = useStore();

  // When a quick-prompt button is clicked, fill the input
  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      setPendingPrompt('');
    }
  }, [pendingPrompt, setPendingPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userQuery = input.trim();
    setInput('');
    
    // Add user message to store
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: new Date()
    });

    setProcessing(true);
    
    // Connect to actual backend
    try {
      setWorkflowStep('safety');
      await new Promise(r => setTimeout(r, 600));
      setWorkflowStep('intent');
      await new Promise(r => setTimeout(r, 600));
      setWorkflowStep('reasoning');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Gemini-Key': geminiApiKey,
        'X-Groq-Key': groqApiKey
      };

      if (currentUser?.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userQuery, sessionId: 'default' })
      });
      
      setWorkflowStep('formatting');
      const data = await res.json();
      await new Promise(r => setTimeout(r, 600));
      setWorkflowStep('complete');
      await new Promise(r => setTimeout(r, 400));
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        intent: data.intent,
        riskLevel: data.riskLevel,
        jsonRaw: data.jsonRaw,
      });

      if (data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH') {
        useStore.getState().incrementStat(data.riskLevel === 'CRITICAL' ? 'injectionAttempts' : 'blockedAttempts');
        setSystemStatus('THREAT_DETECTED');
      } else {
        useStore.getState().incrementStat('safeQueries');
      }
      
    } catch (error) {
      console.error(error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "System Error: Unable to connect to Sentinel API. Please ensure the backend server is running.",
        timestamp: new Date(),
        riskLevel: 'CRITICAL'
      });
    } finally {
      setProcessing(false);
      setWorkflowStep(null);
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className="p-4 bg-sentinel-navy border-t border-sentinel-border relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-sentinel-emerald text-xs font-mono uppercase tracking-widest">
            <ShieldCheck size={14} className="animate-pulse" />
            <span>Safety Scan Enabled</span>
          </div>
          <button 
            onClick={handleClearChat}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            CLEAR CHAT
          </button>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="relative glass-panel rounded-xl flex items-end p-2 border border-sentinel-border/50 focus-within:border-sentinel-cyan/50 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all"
        >
          <div className="flex gap-2 p-2 text-gray-400">
            <label className="hover:text-sentinel-cyan transition-colors cursor-pointer">
              <Paperclip size={20} />
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      // Inject file info into query console input
                      setInput(prev => `${prev}\n[Attached File: ${file.name}]\n${reader.result}`);
                    };
                    if (file.type.startsWith('image/')) {
                      reader.readAsDataURL(file);
                    } else {
                      reader.readAsText(file);
                    }
                  }
                }}
              />
            </label>
            <button type="button" className="hover:text-sentinel-cyan transition-colors"><Mic size={20} /></button>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter secure command or query..."
            className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] p-2 text-white placeholder-gray-500"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-lg ml-2 transition-all ${
              input.trim() && !isProcessing 
                ? 'bg-sentinel-cyan text-sentinel-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.6)]' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={18} className={isProcessing ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
