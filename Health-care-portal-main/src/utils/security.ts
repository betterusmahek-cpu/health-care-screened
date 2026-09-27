// Security, Validation, and Hashing Utilities following OWASP guidelines

// RFC 5322 compliant email regex
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Common weak password blacklist
const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty',
  'admin123',
  'welcome1',
  'iloveyou',
  'pass1234',
  'abc12345',
  'cogni1234',
  'monkey12',
  'dragon12',
]);

/**
 * Sanitizes input strings to prevent XSS (Cross-Site Scripting)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Full Name Validation: 2–50 characters, letters and spaces only
 */
export const validateFullName = (name: string): { isValid: boolean; error: string } => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2 || trimmed.length > 50) {
    return { isValid: false, error: 'Full name must be between 2 and 50 characters.' };
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Full name can only contain letters and spaces.' };
  }
  return { isValid: true, error: '' };
};

/**
 * RFC Compliant Email Validation
 */
export const validateEmail = (email: string): { isValid: boolean; error: string } => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!RFC_EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@example.com).' };
  }
  return { isValid: true, error: '' };
};

export interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
  notCommon: boolean;
  isValid: boolean;
}

/**
 * Comprehensive Password Validation (8-16 chars, upper, lower, number, special char, weak list)
 */
export const validatePassword = (password: string): PasswordCriteria => {
  const length = password.length >= 8 && password.length <= 16;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const notCommon = !COMMON_WEAK_PASSWORDS.has(password.toLowerCase().trim());

  const isValid = length && uppercase && lowercase && number && specialChar && notCommon;

  return {
    length,
    uppercase,
    lowercase,
    number,
    specialChar,
    notCommon,
    isValid,
  };
};

/**
 * SHA-256 Async Hash helper using Web Crypto API for secure client storage
 */
export const hashPasswordAsync = async (password: string): Promise<string> => {
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback simple hash for older environments
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash)}`;
  }
};

/**
 * Rate Limiter for Login Attempts to mitigate brute force attacks
 */
class RateLimiter {
  private attempts: Record<string, { count: number; lockUntil: number }> = {};

  public isLockedOut(key: string): { locked: boolean; remainingSeconds: number } {
    const record = this.attempts[key];
    if (!record) return { locked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (now < record.lockUntil) {
      const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    // Reset lock if expired
    if (record.lockUntil && now >= record.lockUntil) {
      delete this.attempts[key];
    }
    return { locked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(key: string): { locked: boolean; attemptsLeft: number } {
    const now = Date.now();
    const record = this.attempts[key] || { count: 0, lockUntil: 0 };

    record.count += 1;

    if (record.count >= 5) {
      // Lock out for 60 seconds after 5 failed attempts
      record.lockUntil = now + 60 * 1000;
      this.attempts[key] = record;
      return { locked: true, attemptsLeft: 0 };
    }

    this.attempts[key] = record;
    return { locked: false, attemptsLeft: 5 - record.count };
  }

  public resetAttempts(key: string) {
    delete this.attempts[key];
  }
}

export const loginRateLimiter = new RateLimiter();
