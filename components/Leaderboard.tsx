import React, { useEffect, useState } from 'react';
import { getSessions, getUsers } from '../services/storageService';
import { User, Role, ClassDay } from '../types';
import { Trophy, Medal } from 'lucide-react';
import { Card } from './DesignSystem';

interface Ranking {
  id: string;
  name: string;
  classDay?: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all'>('all');
  const [filterDay, setFilterDay] = useState<ClassDay | 'all'>('all');
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [sessions, users] = await Promise.all([getSessions(), getUsers()]);
      const students = users.filter(u => u.role === Role.STUDENT);
      
      const now = new Date();
      const filteredSessions = sessions.filter(s => {
        const sDate = new Date(s.date);
        if (filterDay !== 'all' && s.classDay !== filterDay) return false;
        if (timeframe === 'weekly') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return sDate >= oneWeekAgo;
        }
        if (timeframe === 'monthly') {
          return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
        }
        return true;
      });

      const scores: Record<string, number> = {};
      students.forEach(s => scores[s.id] = 0);

      filteredSessions.forEach(session => {
        session.records.forEach(record => {
          if (scores[record.studentId] !== undefined) {
            scores[record.studentId] += record.totalScore;
          }
        });
      });

      const computedRankings = Object.entries(scores)
        .map(([id, score]) => {
          const student = students.find(s => s.id === id);
          return {
            id,
            name: student?.name || 'Unknown',
            classDay: student?.classDay,
            score
          };
        })
        .sort((a, b) => b.score - a.score);
        
      setRankings(computedRankings);
      setLoading(false);
    };

    loadData();
  }, [timeframe, filterDay]);

  const getRankBadge = (index: number) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><Trophy className="w-4 h-4" /></div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Medal className="w-4 h-4" /></div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Medal className="w-4 h-4" /></div>;
    return <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center text-gray-400 font-bold text-sm">{index + 1}</div>;
  };

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-enter">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h2>
          <p className="text-gray-500 mt-2">Celebrating student achievements</p>
        </div>

        <div className="flex gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
           {/* Custom Segmented Control */}
           {(['weekly', 'monthly', 'all'] as const).map((t) => (
             <button
               key={t}
               onClick={() => setTimeframe(t)}
               className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                 timeframe === t 
                 ? 'bg-gray-900 text-white shadow-lg' 
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
               }`}
             >
               {t}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-4">
        {rankings.slice(0, 5).map((student, index) => (
          <Card 
            key={student.id} 
            className={`
              p-5 flex items-center gap-6 transition-all duration-300
              ${index === 0 ? 'bg-gradient-to-r from-yellow-50/50 to-white border-yellow-100 scale-105 shadow-xl shadow-yellow-500/10 z-10' : 'hover:scale-[1.01]'}
            `}
          >
            <div className="flex-shrink-0">
               {getRankBadge(index)}
            </div>

            <div className="flex-grow">
              <h3 className={`font-bold text-lg ${index === 0 ? 'text-yellow-900' : 'text-gray-900'}`}>{student.name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{student.classDay} Class</p>
            </div>

            <div className="text-right">
              <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                {student.score}
              </span>
              <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">Points</span>
            </div>
          </Card>
        ))}
        
        {rankings.length === 0 && (
           <div className="text-center py-20 text-gray-400">No data found for this period.</div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;