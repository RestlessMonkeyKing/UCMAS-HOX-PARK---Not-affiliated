import { supabase } from './supabase';
import { User, Role, ClassSession, AppSettings, DEFAULT_POINT_VALUES, ClassDay } from '../types';

// --- System ---

export const checkConnection = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // Attempt a lightweight query to check connectivity and RLS policies
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
};

// --- Users ---

export const getUsers = async (): Promise<User[]> => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*, user_children(student_id)');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  // Transform to match local interface
  return users.map((u: any) => ({
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name,
    role: u.role as Role,
    classDay: u.class_day as ClassDay | undefined,
    childrenIds: u.user_children?.map((c: any) => c.student_id) || []
  }));
};

export const saveUser = async (user: User) => {
  // 1. Upsert User
  const { data: savedUser, error } = await supabase
    .from('users')
    .upsert({
      id: user.id, // If id exists, it updates. If new (and generated), ensure it handles it or let DB gen it.
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      class_day: user.classDay
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user:', error);
    return;
  }

  // 2. Handle Children Relations (Delete all then re-insert is easiest for this simple app)
  if (user.role === Role.PARENT) {
    // Delete existing links
    await supabase.from('user_children').delete().eq('parent_id', user.id);
    
    // Insert new links
    if (user.childrenIds && user.childrenIds.length > 0) {
      const links = user.childrenIds.map(childId => ({
        parent_id: user.id,
        student_id: childId
      }));
      await supabase.from('user_children').insert(links);
    }
  }
};

export const deleteUser = async (userId: string) => {
  await supabase.from('users').delete().eq('id', userId);
};

// --- Sessions ---

export const getSessions = async (): Promise<ClassSession[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      session_records (*)
    `);

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    date: s.date,
    classDay: s.class_day as ClassDay,
    activityConfigAtTime: s.activity_config,
    records: s.session_records.map((r: any) => ({
      studentId: r.student_id,
      studentName: r.student_name,
      arrival: r.arrival,
      homework: r.homework,
      classwork: r.classwork,
      listeningCalc: r.listening_calc,
      numberActivity: r.number_activity,
      numberActivityDesc: r.number_activity_desc,
      behaviour: r.behaviour,
      totalScore: r.total_score
    }))
  }));
};

export const saveSession = async (session: ClassSession) => {
  // 1. Upsert Session
  const { data: savedSession, error } = await supabase
    .from('sessions')
    .upsert({
      id: session.id,
      date: session.date,
      class_day: session.classDay,
      activity_config: session.activityConfigAtTime
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving session:', error);
    return;
  }

  // 2. Upsert Records
  // We first delete existing records for this session to ensure clean slate (handling removed students)
  // or we can upsert if we track record IDs. To be safe/simple, let's upsert matching on session_id + student_id? 
  // No, easiest for this logic is delete all for session and re-insert.
  await supabase.from('session_records').delete().eq('session_id', session.id);

  const recordsDb = session.records.map(r => ({
    session_id: session.id,
    student_id: r.studentId,
    student_name: r.studentName,
    arrival: r.arrival,
    homework: r.homework,
    classwork: r.classwork,
    listening_calc: r.listeningCalc,
    number_activity: r.numberActivity,
    number_activity_desc: r.numberActivityDesc,
    behaviour: r.behaviour,
    total_score: r.totalScore
  }));

  if (recordsDb.length > 0) {
    await supabase.from('session_records').insert(recordsDb);
  }
};

// --- Settings ---

export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();
  
  if (error || !data) return { pointValues: DEFAULT_POINT_VALUES };
  return { pointValues: data.point_values };
};

export const saveSettings = async (settings: AppSettings) => {
  // We assume only 1 row in settings, ID 1, or just update the first found.
  // We will upsert with an arbitrary ID check or just delete/insert.
  // Better: check if exists.
  const { data } = await supabase.from('settings').select('id').limit(1);
  
  if (data && data.length > 0) {
    await supabase.from('settings').update({ point_values: settings.pointValues }).eq('id', data[0].id);
  } else {
    await supabase.from('settings').insert({ point_values: settings.pointValues });
  }
};

// --- Auth ---

export const login = async (username: string, passwordAttempt?: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_children(student_id)')
    .ilike('username', username) // Case insensitive match
    .single();

  if (error) {
    console.error("Login Error:", error.message);
    return null;
  }
  
  if (!data) return null;

  const storedPassword = data.password || 'P';
  if (passwordAttempt && storedPassword !== passwordAttempt) {
    console.warn("Login Failed: Incorrect password for user", username);
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    name: data.name,
    role: data.role as Role,
    classDay: data.class_day as ClassDay,
    childrenIds: data.user_children?.map((c: any) => c.student_id) || []
  };
};