import React, { useEffect, useState } from 'react';
import { User, Role, StudentDailyRecord } from '../types';
import { getSessions } from '../services/storageService';
import { TrendingUp, Calendar, Star } from 'lucide-react';
import { Card } from './DesignSystem';

interface Props {
  user: User;
}

interface HistoryItem extends StudentDailyRecord {
  date: string;
}

const StudentParentView: React.FC<Props> = ({ user }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const sessions = await getSessions();
      const studentIds = user.role === Role.STUDENT ? [user.id] : (user.childrenIds || []);

      const computedHistory = sessions
        .flatMap(s => s.records.filter(r => studentIds.includes(r.studentId)).map(r => ({ ...r, date: s.date })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setHistory(computedHistory);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const totalScore = history.reduce((acc, curr) => acc + curr.totalScore, 0);

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading progress...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-enter">
      {/* Hero Card */}
      <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-apple-500/20 rounded-full blur-[80px] -mr-16 -mt-16" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight">Hello, {user.name.split(' ')[0]}</h2>
          <p className="text-gray-400 mt-2 text-lg">Here is your performance summary.</p>
          
          <div className="flex gap-12 mt-10">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Points</p>
              <div className="text-6xl font-bold tracking-tighter flex items-baseline gap-2">
                {totalScore}
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Sessions</p>
              <div className="text-6xl font-bold tracking-tighter text-gray-700">
                {history.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 ml-1">Recent Activity</h3>
        {history.length > 0 ? history.map((record, i) => (
          <Card key={`${record.date}-${i}`} className="p-6 transition-all hover:bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                {record.numberActivityDesc && (
                  <p className="text-gray-900 font-medium mt-1">{record.numberActivityDesc}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                 <Badge label="Arr" active={record.arrival} />
                 <Badge label="HW" active={record.homework} />
                 <Badge label="CW" active={record.classwork} />
                 <Badge label="List" active={record.listeningCalc} />
                 <Badge label="Behav" active={record.behaviour} />
                 <div className="w-px h-8 bg-gray-100 mx-2 hidden md:block"></div>
                 <span className="text-xl font-bold text-apple-600 w-12 text-right">+{record.totalScore}</span>
              </div>
            </div>
          </Card>
        )) : (
          <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No activity recorded yet.</div>
        )}
      </div>
    </div>
  );
};

const Badge = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`
    px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border transition-all
    ${active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-300 border-transparent'}
  `}>
    {label}
  </div>
);

export default StudentParentView;