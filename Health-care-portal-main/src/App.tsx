import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/Auth/LoginView';
import { SignUpView } from './components/Auth/SignUpView';
import { CognitiveScreening } from './components/Screening/CognitiveScreening';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { CompanionType, ScreeningResult, User } from './types';
import { redirectToExternalApp } from './utils/navigation';
import { getUserScreeningResult, saveUserScreeningResult } from './utils/authStorage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isScreeningActive, setIsScreeningActive] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);

  // Load previous diagnosis specifically for the logged in user only
  useEffect(() => {
    if (user) {
      const userResult = getUserScreeningResult(user.id);
      setScreeningResult(userResult);
    } else {
      setScreeningResult(null);
    }
  }, [user?.id]);

  // Handle Login success -> Loads user diagnosis & redirects to Dashboard Home
  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    const userResult = getUserScreeningResult(authenticatedUser.id);
    setScreeningResult(userResult);
    setIsScreeningActive(false);
    setActiveTab('dashboard');
  };

  // Handle Sign Up success -> Redirects directly to 30-Question Assessment
  const handleSignUpSuccess = (newUser: User) => {
    setUser(newUser);
    setScreeningResult(null);
    setIsScreeningActive(true);
  };

  // Handle Screening Completion:
  // - action "route" (ADHD/MCI/Dementia) -> save result, record the
  //   recommended companion, and redirect to the external modules site.
  // - action "exit" (Healthy/Other-Indeterminate) -> save result, but stay
  //   in the app and return to the dashboard instead of redirecting out.
  const handleScreeningComplete = (result: ScreeningResult) => {
    setScreeningResult(result);
    setIsScreeningActive(false);

    if (user) {
      saveUserScreeningResult(user.id, result);
      setUser({
        ...user,
        hasCompletedScreening: true,
        ...(result.action === 'route' && result.recommendedCompanion
          ? {
              recommendedCompanion: result.recommendedCompanion,
              selectedCompanion: result.recommendedCompanion,
            }
          : {}),
        screeningDate: result.timestamp,
      });
    }

    setActiveTab('dashboard');

    if (result.action === 'route') {
      // Redirect user to external modules website
      redirectToExternalApp();
    }
    // action === 'exit': stay in-app on the dashboard; the result modal
    // already showed the exit message before calling this handler.
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
    setIsScreeningActive(false);
    setScreeningResult(null);
  };

  const handleOpenCompanion = (comp: CompanionType) => {
    if (user) {
      setUser({
        ...user,
        selectedCompanion: comp,
      });
    }
    setActiveTab('dashboard');

    // Redirect user to external modules website
    redirectToExternalApp();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C251F] font-sans flex flex-col antialiased selection:bg-[#3F5244] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsScreeningActive(false);
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        onStartScreening={() => {
          setIsScreeningActive(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          /* Auth Views */
          authMode === 'login' ? (
            <LoginView
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignUp={() => setAuthMode('signup')}
            />
          ) : (
            <SignUpView
              onSignUpSuccess={handleSignUpSuccess}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )
        ) : isScreeningActive ? (
          /* 30-Question Assessment */
          <CognitiveScreening
            user={user}
            onScreeningComplete={handleScreeningComplete}
            onCancel={() => setIsScreeningActive(false)}
          />
        ) : (
          /* Dashboard Home */
          <DashboardHome
            user={user}
            screeningResult={screeningResult}
            onOpenCompanion={handleOpenCompanion}
            onStartScreening={() => setIsScreeningActive(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E3E8E2] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#6A786C] space-y-1">
          <p className="font-bold text-[#1C251F]">
            CogniCompanion • Focus, Memory, and Cognitive Support
          </p>
          <p className="max-w-2xl mx-auto text-[11px] text-[#6A786C]">
            Disclaimer: CogniCompanion is a support and wellness tool, not a diagnostic or medical service.
          </p>
        </div>
      </footer>
    </div>
  );
}
