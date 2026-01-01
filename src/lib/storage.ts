// Journal data types for future database integration
export interface MorningEntry {
  id: string;
  date: string;
  mood: number;
  sleepHours: number;
  feelings: string[];
  dailyGoal: string;
  gratitude: [string, string, string];
  affirmation: string;
  breathingCompleted: boolean;
  bodyScanCompleted: boolean;
  mindfulCheckinNotes: string;
  createdAt: string;
}

export interface EveningEntry {
  id: string;
  date: string;
  dayRating: number;
  endMood: number;
  joys: string;
  learnings: string;
  tomorrowAnticipation: string;
  finalThoughts: string;
  createdAt: string;
}

export interface JournalData {
  morningEntries: MorningEntry[];
  eveningEntries: EveningEntry[];
}

const STORAGE_KEY = 'mindful-journal-data';

export const getJournalData = (): JournalData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { morningEntries: [], eveningEntries: [] };
};

export const saveMorningEntry = (entry: MorningEntry): void => {
  const data = getJournalData();
  const existingIndex = data.morningEntries.findIndex(e => e.date === entry.date);
  if (existingIndex >= 0) {
    data.morningEntries[existingIndex] = entry;
  } else {
    data.morningEntries.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveEveningEntry = (entry: EveningEntry): void => {
  const data = getJournalData();
  const existingIndex = data.eveningEntries.findIndex(e => e.date === entry.date);
  if (existingIndex >= 0) {
    data.eveningEntries[existingIndex] = entry;
  } else {
    data.eveningEntries.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getTodaysMorningEntry = (): MorningEntry | undefined => {
  const today = new Date().toISOString().split('T')[0];
  const data = getJournalData();
  return data.morningEntries.find(e => e.date === today);
};

export const getTodaysEveningEntry = (): EveningEntry | undefined => {
  const today = new Date().toISOString().split('T')[0];
  const data = getJournalData();
  return data.eveningEntries.find(e => e.date === today);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
