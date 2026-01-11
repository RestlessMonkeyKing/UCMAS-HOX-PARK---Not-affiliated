import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { Accounts, SettingsPanel } from './components/Management';
import Leaderboard from './components/Leaderboard';
import StudentParentView from './components/StudentParentView';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Check local storage for persistent auth if implemented, 
    // but prompt implies simple session login, so we keep state.
    // Ideally we would persist current user ID in localStorage.
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Set default view based on role
    if (loggedInUser.role === Role.TEACHER) setCurrentView('dashboard');
    else if (loggedInUser.role === Role.STUDENT) setCurrentView('my-progress');
    else if (loggedInUser.role === Role.PARENT) setCurrentView('my-progress');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
      case 'calendar': // Reusing dashboard for calendar view as it contains the picker
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <SettingsPanel />;
      case 'my-progress':
        return <StudentParentView user={user} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;