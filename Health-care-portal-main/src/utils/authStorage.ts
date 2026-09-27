import { User, ScreeningResult } from '../types';
import { DEMO_USER } from '../data/mockData';
import { hashPasswordAsync } from './security';
import { SCREENING_QUESTIONS } from '../data/questions';
import { calculateScreeningResult } from './scoring';

const STORAGE_KEY_USERS = 'cognicompanion_registered_users';

export interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  age: number;
  gender: string;
  createdAt: string;
  hasCompletedScreening: boolean;
  recommendedCompanion?: string;
  selectedCompanion?: string;
  screeningDate?: string;
  screeningResult?: ScreeningResult;
}

// Seed demo user into local storage if not already present
export const initializeAuthStorage = async () => {
  const existing = localStorage.getItem(STORAGE_KEY_USERS);
  if (!existing) {
    const demoHash = await hashPasswordAsync('Password123!');
    
    // Generate default sample screening result for Demo User
    const sampleResponses: Record<number, number> = {};
    SCREENING_QUESTIONS.forEach((q, idx) => {
      sampleResponses[q.id] = idx % 3 === 0 ? 3 : 1;
    });
    const demoResult = calculateScreeningResult(sampleResponses, SCREENING_QUESTIONS);
    demoResult.timestamp = DEMO_USER.screeningDate;

    const demoAccount: StoredAccount = {
      id: DEMO_USER.id,
      fullName: DEMO_USER.fullName,
      email: DEMO_USER.email.toLowerCase().trim(),
      passwordHash: demoHash,
      age: DEMO_USER.age,
      gender: DEMO_USER.gender,
      createdAt: new Date().toISOString(),
      hasCompletedScreening: DEMO_USER.hasCompletedScreening,
      recommendedCompanion: DEMO_USER.recommendedCompanion,
      selectedCompanion: DEMO_USER.selectedCompanion,
      screeningDate: DEMO_USER.screeningDate,
      screeningResult: demoResult,
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([demoAccount]));
    localStorage.setItem(`cognicompanion_screening_${DEMO_USER.id}`, JSON.stringify(demoResult));
  }
};

/**
 * Save screening result specifically for a single user ID
 */
export const saveUserScreeningResult = (userId: string, result: ScreeningResult) => {
  try {
    localStorage.setItem(`cognicompanion_screening_${userId}`, JSON.stringify(result));

    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index].hasCompletedScreening = true;
      if (result.recommendedCompanion) {
        users[index].recommendedCompanion = result.recommendedCompanion;
        users[index].selectedCompanion = result.recommendedCompanion;
      }
      users[index].screeningDate = result.timestamp;
      users[index].screeningResult = result;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to save user screening result', e);
  }
};

/**
 * Retrieve screening result specifically for a single user ID
 */
export const getUserScreeningResult = (userId: string): ScreeningResult | null => {
  try {
    const raw = localStorage.getItem(`cognicompanion_screening_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }

    const users = getRegisteredUsers();
    const user = users.find((u) => u.id === userId);
    if (user?.screeningResult) {
      return user.screeningResult;
    }

    if (userId === DEMO_USER.id) {
      const sampleResponses: Record<number, number> = {};
      SCREENING_QUESTIONS.forEach((q, idx) => {
        sampleResponses[q.id] = idx % 3 === 0 ? 3 : 1;
      });
      const demoResult = calculateScreeningResult(sampleResponses, SCREENING_QUESTIONS);
      demoResult.timestamp = DEMO_USER.screeningDate;
      return demoResult;
    }

    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Retrieve all registered accounts
 */
export const getRegisteredUsers = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Check if an email is already registered
 */
export const isEmailRegistered = (email: string): boolean => {
  const users = getRegisteredUsers();
  const normalized = email.toLowerCase().trim();
  return users.some((u) => u.email.toLowerCase().trim() === normalized);
};

/**
 * Register a new user account with hashed password
 */
export const registerUserAccount = async (
  fullName: string,
  email: string,
  passwordPlain: string,
  age: number,
  gender: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  await initializeAuthStorage();

  const normalizedEmail = email.toLowerCase().trim();
  if (isEmailRegistered(normalizedEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const passwordHash = await hashPasswordAsync(passwordPlain);
  const newAccount: StoredAccount = {
    id: `usr_${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    age,
    gender,
    createdAt: new Date().toISOString(),
    hasCompletedScreening: false,
  };

  const users = getRegisteredUsers();
  users.push(newAccount);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  const userObject: User = {
    id: newAccount.id,
    fullName: newAccount.fullName,
    email: newAccount.email,
    age: newAccount.age,
    gender: newAccount.gender,
    hasCompletedScreening: false,
  };

  return { success: true, user: userObject };
};

/**
 * Authenticate user credentials securely
 */
export const authenticateUserAccount = async (
  email: string,
  passwordPlain: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  await initializeAuthStorage();

  const normalizedEmail = email.toLowerCase().trim();
  const users = getRegisteredUsers();
  const account = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

  if (!account) {
    // OWASP: Generic error to prevent email enumeration
    return { success: false, error: 'Invalid email or password.' };
  }

  const computedHash = await hashPasswordAsync(passwordPlain);
  if (computedHash !== account.passwordHash) {
    // OWASP: Generic error
    return { success: false, error: 'Invalid email or password.' };
  }

  const userObject: User = {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    age: account.age,
    gender: account.gender,
    hasCompletedScreening: account.hasCompletedScreening,
    recommendedCompanion: account.recommendedCompanion as any,
    selectedCompanion: account.selectedCompanion as any,
    screeningDate: account.screeningDate,
  };

  return { success: true, user: userObject };
};
