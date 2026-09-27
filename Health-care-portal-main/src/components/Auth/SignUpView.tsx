import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Calendar,
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import { User as UserType } from '../../types';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  sanitizeInput,
} from '../../utils/security';
import { isEmailRegistered, registerUserAccount } from '../../utils/authStorage';

interface SignUpViewProps {
  onSignUpSuccess: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(42);
  const [gender, setGender] = useState('Female');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time Validation Computations
  const nameValidation = useMemo(() => validateFullName(fullName), [fullName]);
  const emailValidation = useMemo(() => {
    const res = validateEmail(email);
    if (res.isValid && isEmailRegistered(email)) {
      return { isValid: false, error: 'An account with this email address is already registered.' };
    }
    return res;
  }, [email]);

  const passwordCriteria = useMemo(() => validatePassword(password), [password]);
  const ageIsValid = useMemo(() => typeof age === 'number' && age >= 18 && age <= 120, [age]);

  const confirmPasswordMatch = useMemo(() => {
    if (!confirmPassword) return false;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Overall Form Validity Check (Submit button is disabled if false)
  const isFormValid = useMemo(() => {
    return (
      nameValidation.isValid &&
      emailValidation.isValid &&
      passwordCriteria.isValid &&
      confirmPasswordMatch &&
      ageIsValid &&
      agreeTerms
    );
  }, [
    nameValidation.isValid,
    emailValidation.isValid,
    passwordCriteria.isValid,
    confirmPasswordMatch,
    ageIsValid,
    agreeTerms,
  ]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!isFormValid) {
      setGeneralError('Please resolve all validation errors before registering.');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedName = sanitizeInput(fullName.trim());
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

      const res = await registerUserAccount(
        sanitizedName,
        sanitizedEmail,
        password,
        Number(age),
        gender
      );

      if (!res.success || !res.user) {
        setGeneralError(res.error || 'Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Account created successfully! Preparing your assessment...');
      setTimeout(() => {
        onSignUpSuccess(res.user!);
      }, 900);
    } catch (err) {
      setGeneralError('An unexpected security error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Password score computation for visual bar
  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.uppercase) score++;
    if (passwordCriteria.lowercase) score++;
    if (passwordCriteria.number) score++;
    if (passwordCriteria.specialChar) score++;
    if (passwordCriteria.notCommon) score++;
    return Math.min(100, Math.round((score / 6) * 100));
  }, [passwordCriteria]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-5 bg-[#FAF8F5] p-6 sm:p-10 rounded-3xl shadow-sm border border-[#E3E8E2] relative overflow-hidden">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3F5244] text-[#EBF1EB] mb-2 shadow-2xs">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C251F] tracking-tight">Create Secure Account</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#56655A] font-medium">
            Join CogniCompanion for encrypted baseline screening and personalized support.
          </p>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="signup-fullname-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-[#6A786C]">2–50 chars, letters only</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="signup-fullname-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Eleanor Vance"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-[#1C251F] bg-white font-medium transition-all ${
                  touched.fullName && !nameValidation.isValid
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                    : touched.fullName && nameValidation.isValid
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                    : 'border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244]'
                }`}
              />
              {touched.fullName && nameValidation.isValid && (
                <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
            </div>
            {touched.fullName && !nameValidation.isValid && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{nameValidation.error}</p>
            )}
          </div>

          {/* Age & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-age-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1">
                Age (18–120) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="signup-age-input"
                  type="number"
                  min={18}
                  max={120}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  onBlur={() => handleBlur('age')}
                  placeholder="45"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-[#1C251F] bg-white font-medium ${
                    touched.age && !ageIsValid
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                      : 'border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244]'
                  }`}
                />
              </div>
              {touched.age && !ageIsValid && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">Age must be between 18 and 120.</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-gender-select" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1">
                Gender Identity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  id="signup-gender-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244] text-xs text-[#1C251F] bg-white font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="signup-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="eleanor@example.com"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-[#1C251F] bg-white font-medium transition-all ${
                  touched.email && !emailValidation.isValid
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                    : touched.email && emailValidation.isValid
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                    : 'border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244]'
                }`}
              />
              {touched.email && emailValidation.isValid && (
                <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
            </div>
            {touched.email && !emailValidation.isValid && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{emailValidation.error}</p>
            )}
          </div>

          {/* Password Section with Real-time Strength & Criteria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="signup-password-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider">
                Password <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-[#6A786C]">8–16 chars, mixed requirements</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-[#1C251F] bg-white font-medium transition-all ${
                  touched.password && !passwordCriteria.isValid
                    ? 'border-amber-400 focus:ring-2 focus:ring-amber-500'
                    : touched.password && passwordCriteria.isValid
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                    : 'border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244]'
                }`}
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

            {/* Password Strength Progress Bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#56655A]">
                  <span>Password Strength</span>
                  <span className={passwordCriteria.isValid ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                    {passwordCriteria.isValid ? 'Strong' : 'Requirements Pending'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EAEFE9] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrengthScore === 100
                        ? 'bg-emerald-600'
                        : passwordStrengthScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${passwordStrengthScore}%` }}
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {passwordCriteria.length ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>8–16 Characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {passwordCriteria.uppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {passwordCriteria.lowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {passwordCriteria.number ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.specialChar ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {passwordCriteria.specialChar ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>Special Char (!@#$)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.notCommon ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}`}>
                    {passwordCriteria.notCommon ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                    <span>Not Common/Weak</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirmpassword-input" className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1">
              Confirm Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#56655A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-confirmpassword-input"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-[#1C251F] bg-white font-medium transition-all ${
                  touched.confirmPassword && !confirmPasswordMatch
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                    : touched.confirmPassword && confirmPasswordMatch
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                    : 'border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#56655A] hover:text-[#1C251F]"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && !confirmPasswordMatch && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">Passwords do not match.</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="signup-terms-checkbox"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#3F5244] rounded border-[#CBD5CA] focus:ring-[#3F5244]"
              />
              <span className="text-xs text-[#56655A] leading-snug">
                I agree to the Terms of Service & Privacy Policy. I understand that the assessment is for baseline self-reflection and support.
              </span>
            </label>
          </div>

          {/* Submit Button - Disabled until form is valid */}
          <button
            id="btn-signup-submit"
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 mt-2 ${
              isFormValid && !isSubmitting
                ? 'bg-[#3F5244] hover:bg-[#324237] cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
            }`}
          >
            {isSubmitting ? (
              <span>Encrypting & Registering...</span>
            ) : (
              <>
                <span>Register & Start 30-Q Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#E3E8E2] text-center">
          <p className="text-xs text-[#56655A] font-medium">
            Already registered?{' '}
            <button
              id="btn-goto-login"
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-[#3F5244] underline hover:text-[#2E3F32] cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6A786C] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3F5244]" />
          <span>OWASP Compliant • OWASP Rate Limited & Encrypted</span>
        </div>
      </div>
    </div>
  );
};
