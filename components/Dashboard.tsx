import React, { useState, useEffect, useCallback } from 'react';
import { getSessions, saveSession, getUsers, getSettings } from '../services/storageService';
import { User, ClassSession, ClassDay, StudentDailyRecord, Role, ActivityConfig } from '../types';
import { Save, AlertCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { CustomCheckbox, CustomInput, CustomDatePicker, CustomButton, Card } from './DesignSystem';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(false);

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const dayName = getDayName(selectedDate);
  const isClassDay = dayName === 'Sunday' || dayName === 'Tuesday';

  // --- Logic ---
  const loadSessionData = useCallback(async () => {
    setLoading(true);
    setSaveStatus('idle');
    
    // Fetch all necessary data parallel
    const [allUsers, currentSettings, existingSessions] = await Promise.all([
      getUsers(),
      getSettings(),
      getSessions()
    ]);

    const foundSession = existingSessions.find(s => s.date === selectedDate);

    if (foundSession) {
      setSession(foundSession);
    } else if (isClassDay) {
      const classDay = dayName as ClassDay;
      const classStudents = allUsers.filter(u => u.role === Role.STUDENT && u.classDay === classDay);
      
      const newRecords: StudentDailyRecord[] = classStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        arrival: false,
        homework: false,
        classwork: false,
        listeningCalc: false,
        numberActivity: false,
        numberActivityDesc: '',
        behaviour: false,
        totalScore: 0
      }));

      const newSession: ClassSession = {
        id: uuidv4(),
        date: selectedDate,
        classDay: classDay,
        records: newRecords,
        activityConfigAtTime: currentSettings.pointValues
      };
      setSession(newSession);
    } else {
      setSession(null);
    }
    setLoading(false);
  }, [selectedDate, dayName, isClassDay]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  const handleRecordChange = (studentId: string, field: keyof StudentDailyRecord, value: any) => {
    if (!session) return;
    const updatedRecords = session.records.map(record => {
      if (record.studentId === studentId) {
        const updatedRecord = { ...record, [field]: value };
        updatedRecord.totalScore = calculateScore(updatedRecord, session.activityConfigAtTime);
        return updatedRecord;
      }
      return record;
    });
    setSession({ ...session, records: updatedRecords });
    setSaveStatus('idle');
  };

  const calculateScore = (record: StudentDailyRecord, config: ActivityConfig): number => {
    let score = 0;
    if (record.arrival) score += config.arrival;
    if (record.homework) score += config.homework;
    if (record.classwork) score += config.classwork;
    if (record.listeningCalc) score += config.listeningCalc;
    if (record.numberActivity) score += config.numberActivity;
    if (record.behaviour) score += config.behaviour;
    return score;
  };

  const handleSave = async () => {
    if (session) {
      setSaveStatus('saving');
      await saveSession(session);
      setTimeout(() => setSaveStatus('saved'), 600);
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  const applyBatchActivityDesc = (desc: string) => {
    if (!session) return;
    const updatedRecords = session.records.map(r => ({ ...r, numberActivityDesc: desc }));
    setSession({ ...session, records: updatedRecords });
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-enter">
         <div className="w-8 h-8 border-4 border-apple-500/30 border-t-apple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isClassDay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-enter">
        <div className="bg-white p-6 rounded-full shadow-lg shadow-gray-200/50 mb-6">
          <CalendarIcon className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Classes Scheduled</h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          Classes are currently scheduled for <span className="font-semibold text-gray-900">Sundays</span> and <span className="font-semibold text-gray-900">Tuesdays</span>.
        </p>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <CustomButton variant="ghost" onClick={() => changeDate(-1)} icon={ChevronLeft}>Prev</CustomButton>
          <CustomDatePicker value={selectedDate} onChange={(e: any) => setSelectedDate(e.target.value)} />
          <CustomButton variant="ghost" onClick={() => changeDate(1)}>Next <ChevronRight className="w-4 h-4 ml-2" /></CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full animate-enter pb-20">
      {/* --- Header --- */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-4 lg:p-6 rounded-3xl border border-white/50 shadow-sm sticky top-0 z-20 transition-all">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="bg-apple-500 text-white p-3 rounded-2xl shadow-lg shadow-apple-500/20">
            <span className="text-xl font-bold">{dayName.substring(0,3)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{dayName} Class</h2>
            <p className="text-gray-500 text-sm font-medium">Tracking attendance & progress</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
           {/* Date Nav */}
           <div className="flex items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner w-full sm:w-auto justify-between">
              <CustomButton variant="ghost" onClick={() => changeDate(-1)} className="px-3 h-9"><ChevronLeft className="w-5 h-5" /></CustomButton>
              <CustomDatePicker value={selectedDate} onChange={(e: any) => setSelectedDate(e.target.value)} className="min-w-[140px]" />
              <CustomButton variant="ghost" onClick={() => changeDate(1)} className="px-3 h-9"><ChevronRight className="w-5 h-5" /></CustomButton>
           </div>

           {/* Save Button */}
           <div className="w-full sm:w-auto">
             <CustomButton 
                onClick={handleSave}
                disabled={!session || saveStatus === 'saving'}
                variant="primary"
                className={`
                  w-full sm:w-auto h-12 sm:h-[52px] px-6 rounded-2xl font-semibold shadow-lg transition-all duration-300
                  ${saveStatus === 'saved' ? '!bg-green-500 hover:!bg-green-600 shadow-green-500/20' : 'shadow-apple-500/20'}
                `}
             >
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving</span>
                ) : saveStatus === 'saved' ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Saved</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="w-5 h-5"/> Save Session</span>
                )}
             </CustomButton>
           </div>
        </div>
      </div>

      {/* --- Main Table Card --- */}
      <Card className="overflow-visible">
        {session && session.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-5 rounded-tl-2xl">Student</th>
                  <th className="px-4 py-5 text-center w-24">Arrival</th>
                  <th className="px-4 py-5 text-center w-24">Homework</th>
                  <th className="px-4 py-5 text-center w-24">Classwork</th>
                  <th className="px-4 py-5 text-center w-24">Listening</th>
                  <th className="px-4 py-5 text-center min-w-[220px]">
                     <div className="flex flex-col items-center gap-1">
                      <span>Number Activity</span>
                      <input 
                        type="text" 
                        placeholder="Batch Description..." 
                        className="w-full text-center text-[10px] bg-transparent border-b border-gray-300 focus:border-apple-500 outline-none placeholder-gray-400 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') applyBatchActivityDesc(e.currentTarget.value);
                        }}
                      />
                     </div>
                  </th>
                  <th className="px-4 py-5 text-center w-24">Behaviour</th>
                  <th className="px-6 py-5 text-right rounded-tr-2xl">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {session.records.map((record, idx) => (
                  <tr 
                    key={record.studentId} 
                    className="group transition-all duration-200 hover:bg-apple-50/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative z-0 hover:z-10"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs shadow-inner">
                          {record.studentName.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-apple-600 transition-colors">
                          {record.studentName}
                        </span>
                      </div>
                    </td>
                    
                    {/* Checkboxes */}
                    {['arrival', 'homework', 'classwork', 'listeningCalc'].map((key) => (
                      <td key={key} className="px-4 py-4">
                        <div className="flex justify-center">
                          <CustomCheckbox
                            checked={record[key as keyof StudentDailyRecord] as boolean}
                            onChange={(checked) => handleRecordChange(record.studentId, key as keyof StudentDailyRecord, checked)}
                          />
                        </div>
                      </td>
                    ))}

                    {/* Number Activity */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-transparent group-hover:border-gray-100 group-hover:bg-white transition-all">
                        <CustomCheckbox
                          checked={record.numberActivity}
                          onChange={(checked) => handleRecordChange(record.studentId, 'numberActivity', checked)}
                        />
                        <input 
                          type="text"
                          value={record.numberActivityDesc}
                          onChange={(e) => handleRecordChange(record.studentId, 'numberActivityDesc', e.target.value)}
                          placeholder="Activity details..."
                          className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none border-b border-transparent focus:border-apple-300 transition-all pb-0.5"
                        />
                      </div>
                    </td>

                    {/* Behaviour */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                         <CustomCheckbox
                            checked={record.behaviour}
                            onChange={(checked) => handleRecordChange(record.studentId, 'behaviour', checked)}
                          />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className={`
                        inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full font-bold text-sm transition-all duration-500
                        ${record.totalScore > 20 ? 'bg-green-100 text-green-700' : 
                          record.totalScore > 10 ? 'bg-apple-100 text-apple-700' : 'bg-gray-100 text-gray-500'}
                      `}>
                        {record.totalScore}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
               <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Students Found</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              There are no students assigned to the <span className="font-semibold">{dayName}</span> class yet. 
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;