export enum Role {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum ClassDay {
  SUNDAY = 'Sunday',
  TUESDAY = 'Tuesday',
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  classDay?: ClassDay; // For students
  childrenIds?: string[]; // For parents
}

export interface ActivityConfig {
  arrival: number;
  homework: number;
  classwork: number;
  listeningCalc: number;
  numberActivity: number;
  behaviour: number;
}

export interface StudentDailyRecord {
  studentId: string;
  studentName: string;
  arrival: boolean;
  homework: boolean;
  classwork: boolean;
  listeningCalc: boolean;
  numberActivity: boolean;
  numberActivityDesc: string;
  behaviour: boolean;
  totalScore: number;
}

export interface ClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  classDay: ClassDay;
  records: StudentDailyRecord[];
  activityConfigAtTime: ActivityConfig; // Snapshot of point values used
}

export interface AppSettings {
  pointValues: ActivityConfig;
}

export const DEFAULT_POINT_VALUES: ActivityConfig = {
  arrival: 5,
  homework: 5,
  classwork: 5,
  listeningCalc: 5,
  numberActivity: 5,
  behaviour: 5,
};