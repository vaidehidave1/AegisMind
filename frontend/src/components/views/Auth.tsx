import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Shield, Key, User, Image, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function Auth() {
  const { setCurrentUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { username, password }
      : { username, password, profilePic };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      setCurrentUser({
        username: data.username,
        profilePic: data.profilePic,
        token: data.token
      });
    } catch (err: any) {
      setError(err.message || 'Connection error. Make sure the API backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-sentinel-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sentinel-navy via-sentinel-black to-sentinel-black p-4">
      <div className="max-w-md w-full glass-panel border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-sentinel-cyan/5 blur-3xl opacity-30 rounded-full -top-12"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 flex items-center justify-center bg-sentinel-cyan/10 rounded-2xl border border-sentinel-cyan/30 text-sentinel-cyan mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-heading font-bold tracking-widest text-white">SENTINEL ACCESS</h1>
          <p className="text-xs text-sentinel-cyan font-mono uppercase tracking-wider mt-1">
            {isLogin ? 'AUTHENTICATE USER SESSION' : 'REGISTER NEW SECURITY ACCOUNT'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-sentinel-red/20 bg-sentinel-red/5 text-sentinel-red text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Profile Photo URL</label>
              <div className="relative">
                <Image className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-black/40 border border-white/15 focus:border-sentinel-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-sentinel-cyan hover:bg-white text-sentinel-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all font-mono font-bold tracking-wider rounded-xl text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-gray-400 hover:text-sentinel-cyan transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
