import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail, ShieldCheck, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { DEMO_USER } from '../../data/mockData';
import { User } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { validateEmail, sanitizeInput, loginRateLimiter } from '../../utils/security';
import { authenticateUserAccount } from '../../utils/authStorage';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('sarah.j@example.com');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailValidation = validateEmail(email);
  const isFormValid = emailValidation.isValid && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!emailValidation.isValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password field must not be empty.');
      return;
    }

    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    // Rate limiting check
    const rateCheck = loginRateLimiter.isLockedOut(sanitizedEmail);
    if (rateCheck.locked) {
      setError(`Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds before trying again.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const authResult = await authenticateUserAccount(sanitizedEmail, password);

      if (!authResult.success || !authResult.user) {
        // Record failed attempt for rate limiting
        const limitResult = loginRateLimiter.recordFailedAttempt(sanitizedEmail);

        if (limitResult.locked) {
          setError('Too many failed attempts. Account login temporarily locked for 60 seconds.');
        } else {
          // Generic OWASP error message
          setError('Invalid email or password');
        }
        setIsSubmitting(false);
        return;
      }

      // Reset rate limiter on success
      loginRateLimiter.resetAttempts(sanitizedEmail);

      const userWithRemember: User = {
        ...authResult.user,
        rememberMe,
      };

      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(userWithRemember);
      }, 700);
    } catch (err) {
      setError('Invalid email or password');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setSuccessMessage('Logging in as Demo User...');
    setTimeout(() => {
      onLoginSuccess({
        ...DEMO_USER,
        rememberMe: true,
      });
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-[#FAF8F5] p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E3E8E2] relative overflow-hidden">
        {/* Header */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3F5244] text-[#EBF1EB] mb-3 shadow-2xs">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C251F] tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#56655A] font-medium">
            Sign in to access CogniCompanion & personalized modules.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 relative z-10" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="login-email-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="user@cognicompanion.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244] focus:border-[#3F5244] text-xs text-[#1C251F] bg-white font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider">
                Password
              </label>
              <button
                id="btn-forgot-password"
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs font-bold text-[#3F5244] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244] focus:border-[#3F5244] text-xs text-[#1C251F] bg-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#56655A] hover:text-[#1C251F]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="login-remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#3F5244] rounded border-[#CBD5CA] focus:ring-[#3F5244]"
              />
              <span className="text-xs font-semibold text-[#56655A]">Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 ${
              isFormValid && !isSubmitting
                ? 'bg-[#3F5244] hover:bg-[#324237] cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
            }`}
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Access */}
        <div className="pt-2 relative z-10 border-t border-[#E3E8E2]">
          <div className="bg-[#EEF2ED] rounded-xl p-3 border border-[#D5DDD3] mb-4 text-center">
            <p className="text-xs text-[#1C251F] font-bold flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#3F5244]" /> Quick Demo Access
            </p>
            <button
              id="btn-demo-login"
              type="button"
              onClick={handleDemoLogin}
              className="mt-2 w-full py-2 bg-white text-[#3F5244] hover:bg-[#FAF8F5] border border-[#CBD5CA] rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Sign In as Demo User (Sarah J.)
            </button>
          </div>

          <p className="text-center text-xs font-medium text-[#56655A]">
            Don't have an account?{' '}
            <button
              id="btn-goto-signup"
              type="button"
              onClick={onSwitchToSignUp}
              className="font-bold text-[#3F5244] underline hover:text-[#2E3F32] cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#6A786C] pt-2 border-t border-[#E3E8E2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3F5244]" />
          <span>OWASP Rate Limited • Encrypted Session</span>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};
