import React, { useState } from 'react';
import { Mail, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { validateEmail, sanitizeInput } from '../../utils/security';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError('Please enter a valid email address.');
      return;
    }

    const sanitized = sanitizeInput(email.trim().toLowerCase());
    setEmail(sanitized);
    setSubmitted(true);
  };

  return (
    <div id="forgot-password-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] rounded-3xl shadow-xl border border-[#E3E8E2] max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={() => {
            setSubmitted(false);
            setError('');
            onClose();
          }}
          className="absolute top-4 right-4 text-[#56655A] hover:text-[#1C251F] p-1.5 rounded-xl hover:bg-[#EEF2ED] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#3F5244] text-[#EBF1EB] flex items-center justify-center mb-4 shadow-2xs">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1C251F] tracking-tight mb-1">Reset Password</h3>
            <p className="text-xs sm:text-sm text-[#56655A] font-medium mb-5">
              Enter your registered account email address and we will dispatch secure password recovery instructions.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C251F] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#CBD5CA] focus:ring-2 focus:ring-[#3F5244] focus:border-[#3F5244] text-xs text-[#1C251F] bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError('');
                    onClose();
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-[#56655A] hover:bg-[#EEF2ED] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#3F5244] hover:bg-[#324237] rounded-xl shadow-2xs cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1C251F] mb-1">Check Your Inbox</h3>
            <p className="text-xs sm:text-sm text-[#56655A] font-medium mb-6">
              Password recovery instructions have been dispatched to <span className="font-bold text-[#1C251F]">{email}</span>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
                setError('');
                onClose();
              }}
              className="w-full py-3 text-xs font-bold text-white bg-[#3F5244] hover:bg-[#324237] rounded-xl shadow-2xs cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
