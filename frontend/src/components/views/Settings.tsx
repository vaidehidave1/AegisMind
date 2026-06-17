import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Settings as SettingsIcon, ShieldCheck, Key, RefreshCw, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function Settings() {
  const { geminiApiKey, setGeminiApiKey, groqApiKey, setGroqApiKey, messages, currentUser, setCurrentUser } = useStore();
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(geminiApiKey);
  const [groqApiKeyInput, setGroqApiKeyInput] = useState(groqApiKey || '');
  const [newProfilePic, setNewProfilePic] = useState(currentUser?.profilePic || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'updating' | 'updated'>('idle');

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(geminiApiKeyInput.trim());
    setGroqApiKey(groqApiKeyInput.trim());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileStatus('updating');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ profilePic: newProfilePic.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({
          ...currentUser,
          profilePic: data.profilePic
        });
        setProfileStatus('updated');
        setTimeout(() => setProfileStatus('idle'), 2000);
      } else {
        setProfileStatus('idle');
      }
    } catch {
      setProfileStatus('idle');
    }
  };

  const handleClearHistory = () => {
    useStore.setState({ messages: [] });
  };

  const handleResetStats = () => {
    useStore.setState({
      stats: {
        safeQueries: 0,
        blockedAttempts: 0,
        injectionAttempts: 0,
      }
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy/40 via-sentinel-black to-sentinel-black p-6">
      <header className="h-16 border-b border-sentinel-border/50 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-sentinel-cyan" size={20} />
          <h2 className="text-xl font-heading font-bold tracking-widest text-white">SETTINGS</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-cyan/30 text-sentinel-cyan bg-sentinel-cyan/10">CONTROL SYSTEM</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-w-2xl">
        {/* User Account Settings */}
        {currentUser && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-sentinel-cyan">
              <div className="w-12 h-12 rounded-full border border-sentinel-cyan/30 overflow-hidden bg-black/40 flex items-center justify-center">
                {newProfilePic ? (
                  <img src={newProfilePic} alt="new-avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sentinel-cyan text-lg font-bold">{currentUser.username.slice(0,2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">User Account ({currentUser.username})</h3>
                <p className="text-xs text-gray-400">Modify profile photo / avatar details.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">PROFILE PHOTO URL</label>
                  <input
                    type="url"
                    value={newProfilePic}
                    onChange={(e) => setNewProfilePic(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg px-4 py-2 text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">UPLOAD IMAGE FILE</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sentinel-cyan/10 file:text-sentinel-cyan file:cursor-pointer hover:file:bg-sentinel-cyan/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors ${
                  profileStatus === 'updated'
                    ? 'bg-sentinel-emerald text-sentinel-black'
                    : 'bg-sentinel-cyan text-sentinel-black hover:bg-white'
                }`}
              >
                {profileStatus === 'updating' ? 'UPDATING...' : profileStatus === 'updated' ? 'PROFILE UPDATED ✓' : 'SAVE PROFILE PHOTO'}
              </button>
            </form>
          </div>
        )}

        {/* API Keys Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sentinel-cyan">
            <Key size={18} />
            <h3 className="font-heading font-semibold text-white">API Configuration</h3>
          </div>
          <p className="text-xs text-gray-400">
            Configure your Gemini or Groq API keys to allow Sentinel to retrieve real model responses. The keys are securely saved directly in your browser's local storage and only transmitted to the local proxy backend.
          </p>

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">GEMINI API KEY</label>
              <input
                type="password"
                value={geminiApiKeyInput}
                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                placeholder="Enter AIzaSy..."
                className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg px-4 py-2 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">GROQ API KEY</label>
              <input
                type="password"
                value={groqApiKeyInput}
                onChange={(e) => setGroqApiKeyInput(e.target.value)}
                placeholder="Enter gsk_..."
                className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg px-4 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
            
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-sentinel-emerald text-sentinel-black'
                  : 'bg-sentinel-cyan text-sentinel-black hover:bg-white'
              }`}
            >
              {saveStatus === 'saved' ? 'KEYS CONFIGURED ✓' : 'SAVE CONFIGURATION'}
            </button>
          </form>
        </div>

        {/* Security Policies */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sentinel-emerald">
            <ShieldCheck size={18} />
            <h3 className="font-heading font-semibold text-white">Guardrail Rules</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div>
                <p className="font-medium text-white">Prompt Injection Filtering (PI_101)</p>
                <p className="text-xs text-gray-400">Detect instruction override and system directive evasion attempts.</p>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-emerald/30 text-sentinel-emerald bg-sentinel-emerald/10 font-bold">ACTIVE</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div>
                <p className="font-medium text-white">Credential Leak Protection (DLP_303)</p>
                <p className="text-xs text-gray-400">Intercept passwords, system access tokens, and API secret exposures.</p>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-mono border border-sentinel-emerald/30 text-sentinel-emerald bg-sentinel-emerald/10 font-bold">ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-6 rounded-2xl border border-sentinel-red/20 bg-sentinel-red/5 space-y-4">
          <h3 className="font-heading font-semibold text-white uppercase tracking-wider text-sm">Danger Zone</h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">Clear Conversational Logs</p>
              <p className="text-xs text-gray-400">Permanently delete current chat messages and reset logs.</p>
            </div>
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sentinel-red/30 bg-sentinel-red/10 hover:bg-sentinel-red/20 text-sentinel-red transition-colors text-xs font-mono font-bold"
            >
              <Trash2 size={12} /> CLEAR HISTORY ({messages.length})
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-sentinel-red/10 pt-4">
            <div>
              <p className="font-semibold text-white text-sm">Reset Security Telemetry</p>
              <p className="text-xs text-gray-400">Zero out the database counters of safe and blocked operations.</p>
            </div>
            <button 
              onClick={handleResetStats}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sentinel-red/30 bg-sentinel-red/10 hover:bg-sentinel-red/20 text-sentinel-red transition-colors text-xs font-mono font-bold"
            >
              <RefreshCw size={12} /> RESET STATS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
