import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Trophy, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.TEACHER] },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, roles: [Role.TEACHER] },
    { id: 'accounts', label: 'Accounts', icon: Users, roles: [Role.TEACHER] },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, roles: [Role.TEACHER, Role.STUDENT] },
    { id: 'my-progress', label: 'My Progress', icon: Trophy, roles: [Role.STUDENT, Role.PARENT] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [Role.TEACHER] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white/50">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-apple-500 rounded-lg flex items-center justify-center text-white text-lg shadow-md shadow-apple-500/30">✦</div>
          <span>UCMAS</span>
        </h1>
        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-semibold pl-1">Hoxton Park</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNav.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                relative flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 group overflow-hidden
                ${isActive 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' 
                  : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
                }
              `}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.label}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-700">
            {user.name.charAt(0)}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex text-gray-900 font-sans">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 text-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-enter">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200/50 fixed h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <NavContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-6xl mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
