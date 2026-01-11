import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { login, checkConnection } from '../services/storageService';
import { UserCircle2, Lock, ArrowRight, ShieldCheck, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { CustomInput, CustomButton } from './DesignSystem';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Connection Status State
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionMsg, setConnectionMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      const { success, message } = await checkConnection();
      if (success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setConnectionMsg(message || 'Unknown error');
      }
    };
    verify();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!username || !password) {
        setError('Please enter username and password');
        setLoading(false);
        return;
      }

      const user = await login(username, password);
      
      if (user) {
        onLogin(user);
      } else {
        // If connection is okay but login fails, it's strictly credentials or user missing
        setError('Invalid credentials. If "Teacher" account is missing, check database seed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'Teacher', label: 'Teacher', bg: 'bg-blue-50 text-blue-600', hover: 'hover:bg-blue-100' },
    { id: 'Student', label: 'Student', bg: 'bg-green-50 text-green-600', hover: 'hover:bg-green-100' },
    { id: 'Parent', label: 'Parent', bg: 'bg-purple-50 text-purple-600', hover: 'hover:bg-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[420px] p-8 lg:p-12 border border-white/50 animate-enter relative z-10">
        
        {/* Connection Status Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {connectionStatus === 'checking' && (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full border border-gray-200">
               <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
               <span className="text-[10px] font-medium text-gray-500">Checking DB...</span>
             </div>
          )}
          {connectionStatus === 'connected' && (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-green-700">System Online</span>
             </div>
          )}
          {connectionStatus === 'error' && (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full border border-red-100 group cursor-help relative">
               <WifiOff className="w-3 h-3 text-red-500" />
               <span className="text-[10px] font-bold text-red-700">DB Error</span>
               {/* Tooltip */}
               <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 {connectionMsg}
               </div>
             </div>
          )}
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-apple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-apple-500/30 animate-bounce-sm">
            <span className="text-white text-3xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to UCMAS Hoxton Park</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <CustomInput
              icon={UserCircle2}
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <CustomInput
              icon={Lock}
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl flex items-center border border-red-100 animate-enter">
              <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <CustomButton 
            variant="primary" 
            loading={loading} 
            disabled={connectionStatus === 'error'}
            className="w-full h-12 text-base shadow-xl shadow-apple-500/20"
          >
             Sign In <ArrowRight className="ml-2 w-4 h-4" />
          </CustomButton>
        </form>

        <div className="mt-10">
          <p className="text-[10px] text-gray-400 text-center mb-4 uppercase tracking-widest font-semibold">Quick Access</p>
          <div className="flex gap-2 justify-center">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => { setUsername(r.id); setPassword('P'); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${r.bg} ${r.hover}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;