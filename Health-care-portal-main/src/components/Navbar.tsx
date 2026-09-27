import React from 'react';
import { Activity, Leaf, Calendar, FileText, Heart, LogOut, Shield, Sparkles, Brain } from 'lucide-react';
import { CompanionType, User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onStartScreening: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onStartScreening,
}) => {
  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E9E3] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching CogniCompanion image */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-[#3F5244] flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-5 h-5 text-[#EBF1EB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#1C251F]">
                  CogniCompanion
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#3F5244] text-white shadow-2xs'
                    : 'text-[#3B4D3F] hover:bg-[#EEF2ED]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Home
              </button>

              <button
                id="nav-tab-screening"
                onClick={onStartScreening}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#3B4D3F] hover:bg-[#EEF2ED] transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E0986C]" />
                Take 30-Q Assessment
              </button>
            </nav>
          )}

          {/* User Profile / Status */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-full bg-[#3F5244] text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-bold text-[#1C251F] leading-tight">{user.fullName}</p>
                  <p className="text-[#627366] text-[11px]">{user.email}</p>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#627366] hidden sm:inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#3F5244]" /> Cognitive Support Portal
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
