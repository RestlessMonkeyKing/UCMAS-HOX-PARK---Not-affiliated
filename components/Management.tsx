import React, { useState, useEffect } from 'react';
import { User, Role, ClassDay, AppSettings, DEFAULT_POINT_VALUES } from '../types';
import { getUsers, saveUser, deleteUser, getSettings, saveSettings } from '../services/storageService';
import { Plus, Trash2, Download, Settings, UserPlus, Users, Key, Eye, EyeOff, Save, X } from 'lucide-react';
import { CustomInput, CustomSelect, CustomButton, Card } from './DesignSystem';
import { v4 as uuidv4 } from 'uuid';

export const Accounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    role: Role.STUDENT, 
    classDay: ClassDay.SUNDAY,
    selectedChildId: '',
    password: 'P'
  });

  // State for password editing
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const students = users.filter(u => u.role === Role.STUDENT);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;

    const user: User = {
      id: uuidv4(),
      username: newUser.name.split(' ')[0] + Math.floor(Math.random() * 100),
      name: newUser.name,
      role: newUser.role,
      password: newUser.password || 'P',
      classDay: newUser.role === Role.STUDENT ? newUser.classDay : undefined,
      childrenIds: newUser.role === Role.PARENT && newUser.selectedChildId ? [newUser.selectedChildId] : undefined
    };

    await saveUser(user);
    fetchData();
    setNewUser({ ...newUser, name: '', selectedChildId: '', password: 'P' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this user?')) {
      await deleteUser(id);
      fetchData();
    }
  };

  const getLinkedChildrenNames = (childIds?: string[]) => {
    if (!childIds || childIds.length === 0) return null;
    return childIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditingPassword = (user: User) => {
    setEditingPasswordId(user.id);
    setTempPassword(user.password || 'P');
    // Ensure it's visible when editing
    setShowPasswords(prev => ({ ...prev, [user.id]: true }));
  };

  const savePassword = async (user: User) => {
    const updatedUser = { ...user, password: tempPassword };
    await saveUser(updatedUser);
    fetchData();
    setEditingPasswordId(null);
  };

  const cancelEditPassword = () => {
    setEditingPasswordId(null);
    setTempPassword('');
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading accounts...</div>;

  return (
    <div className="space-y-8 animate-enter max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form */}
        <div className="w-full md:w-1/3">
           <Card className="p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-100 p-2 rounded-xl">
                <UserPlus className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="font-bold text-gray-900">Add New User</h2>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Full Name</label>
                <CustomInput
                  value={newUser.name}
                  onChange={(e: any) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Role</label>
                <CustomSelect
                  value={newUser.role}
                  onChange={(e: any) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  options={[
                    { value: Role.STUDENT, label: 'Student' },
                    { value: Role.PARENT, label: 'Parent' },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Password</label>
                <CustomInput
                  value={newUser.password}
                  onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Default: P"
                />
              </div>

              {newUser.role === Role.STUDENT && (
                <div className="animate-enter">
                  <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Class Day</label>
                  <CustomSelect
                    value={newUser.classDay}
                    onChange={(e: any) => setNewUser({ ...newUser, classDay: e.target.value as ClassDay })}
                    options={[
                      { value: ClassDay.SUNDAY, label: 'Sunday' },
                      { value: ClassDay.TUESDAY, label: 'Tuesday' },
                    ]}
                  />
                </div>
              )}

              {newUser.role === Role.PARENT && (
                <div className="animate-enter">
                  <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Link Student</label>
                  <CustomSelect
                    value={newUser.selectedChildId}
                    onChange={(e: any) => setNewUser({ ...newUser, selectedChildId: e.target.value })}
                    options={[
                      { value: '', label: 'Select a student...' },
                      ...students.map(s => ({ value: s.id, label: s.name }))
                    ]}
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1 leading-relaxed">
                    Select the student this parent is responsible for.
                  </p>
                </div>
              )}

              <CustomButton variant="primary" type="submit" className="w-full mt-2" icon={Plus}>
                Create Account
              </CustomButton>
            </form>
           </Card>
        </div>

        {/* List */}
        <div className="w-full md:w-2/3">
           <Card className="min-h-[500px]">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <Users className="w-5 h-5 text-gray-700" />
                  </div>
                  <h2 className="font-bold text-gray-900">All Accounts</h2>
                </div>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg text-gray-500">{users.length} Total</span>
             </div>
             
             <div className="divide-y divide-gray-50">
               {users.map((user, idx) => (
                 <div key={user.id} className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group animate-enter gap-4" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                        ${user.role === Role.TEACHER ? 'bg-blue-100 text-blue-600' : 
                          user.role === Role.STUDENT ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-600'}
                      `}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">@{user.username}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{user.role}</span>
                          {user.classDay && <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500">{user.classDay}</span>}
                          {user.role === Role.PARENT && user.childrenIds && (
                             <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded border border-purple-100 truncate max-w-[150px]">
                               Child: {getLinkedChildrenNames(user.childrenIds)}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-14 sm:pl-0">
                       {/* Password Section */}
                       <div className="flex items-center bg-white border border-gray-200 rounded-lg h-8 px-2 shadow-sm">
                          <Key className="w-3 h-3 text-gray-400 mr-2" />
                          {editingPasswordId === user.id ? (
                            <input 
                              type="text" 
                              value={tempPassword}
                              onChange={(e) => setTempPassword(e.target.value)}
                              className="w-24 text-xs outline-none bg-transparent"
                              autoFocus
                            />
                          ) : (
                             <span className="text-xs font-mono text-gray-600 w-24 truncate">
                               {showPasswords[user.id] ? (user.password || 'P') : '•••••••'}
                             </span>
                          )}
                          
                          {editingPasswordId === user.id ? (
                            <div className="flex gap-1 ml-2">
                               <button onClick={() => savePassword(user)} className="text-green-600 hover:text-green-700"><Save className="w-3 h-3" /></button>
                               <button onClick={cancelEditPassword} className="text-red-500 hover:text-red-600"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-1 ml-2">
                               <button onClick={() => togglePasswordVisibility(user.id)} className="text-gray-400 hover:text-gray-600">
                                 {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                               </button>
                               <button onClick={() => startEditingPassword(user)} className="text-blue-400 hover:text-blue-600 text-[10px] font-bold uppercase">
                                 Edit
                               </button>
                            </div>
                          )}
                       </div>

                       {user.role !== Role.TEACHER && (
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                 </div>
               ))}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  const [settings, setLocalSettings] = useState<AppSettings>({ pointValues: DEFAULT_POINT_VALUES });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setLocalSettings(s);
      setLoading(false);
    });
  }, []);

  const handlePointChange = (key: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      pointValues: { ...prev.pointValues, [key]: parseInt(value) || 0 }
    }));
  };

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = async () => {
    const [users, sessions, settingsData] = await Promise.all([
      getUsers(),
      import('../services/storageService').then(m => m.getSessions()),
      getSettings()
    ]);

    const data = {
      users,
      sessions,
      settings: settingsData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ucmas_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-enter">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-apple-50 p-2.5 rounded-xl">
             <Settings className="w-6 h-6 text-apple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Scoring Configuration</h2>
            <p className="text-gray-500 text-sm">Adjust the point values for each activity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {Object.entries(settings.pointValues).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <CustomInput
                type="number"
                value={value}
                onChange={(e: any) => handlePointChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
          <CustomButton onClick={handleSave} variant="primary">
            {saved ? 'Settings Saved' : 'Save Changes'}
          </CustomButton>
        </div>
      </Card>

      <Card className="p-8 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Data Export</h2>
          <p className="text-gray-500 text-sm mt-1">Download a JSON backup of all local data.</p>
        </div>
        <CustomButton onClick={exportData} variant="secondary" icon={Download}>
          Export Data
        </CustomButton>
      </Card>
    </div>
  );
};