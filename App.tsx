import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { FoodLogger, ExerciseLogger } from './components/Loggers';
import { ProfileSettings } from './components/ProfileSettings';
import { MealHistory } from './components/MealHistory';
import { Onboarding } from './components/Onboarding';
import { LogEntry, UserProfile, LogType } from './types';
import { DEFAULT_PROFILE, NAV_ITEMS, APP_NAME, getTodayDateString } from './constants';
import { LogOut } from 'lucide-react';

// New layout component to wrap pages and include ad space
const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // This wrapper provides padding at the bottom for the ad and the fixed mobile nav.
    <div className="pb-32 md:pb-0"> 
      {children}
      {/* Ad space container - consistently placed at the end of page content */}
      <div className="mt-8">
        <div className="w-full h-24 bg-slate-200 border border-brand-gray rounded-lg flex items-center justify-center text-slate-500 font-medium text-sm">
          <span className="uppercase tracking-wider">Advertisement</span>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  // -- State --
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navParams, setNavParams] = useState<any>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // -- Resize Listener --
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -- Persistence --
  useEffect(() => {
    const storedProfile = localStorage.getItem('cp_profile');
    const storedLogs = localStorage.getItem('cp_logs');
    const hasSkippedOnboarding = sessionStorage.getItem('cp_skip_onboarding');

    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    } else {
      // If no profile, and onboarding hasn't been skipped this session, show it.
      if (!hasSkippedOnboarding) {
        setShowOnboarding(true);
      }
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
    setLoading(false);
  }, []);

  // -- Auto-sync simulation effect --
  useEffect(() => {
    const today = getTodayDateString();
    const hasSyncedToday = logs.some(log => 
        log.name.includes('Synced Daily Steps') && 
        new Date(log.timestamp).toISOString().startsWith(today)
    );

    if (userProfile.connectedServices.length > 0 && !hasSyncedToday && !loading) {
        const stepsLog: LogEntry = {
            id: `sync_${today}`,
            type: LogType.EXERCISE,
            name: `Synced Daily Steps (${userProfile.connectedServices.join(', ')})`,
            calories: Math.floor(Math.random() * (350 - 150 + 1)) + 150, // Random steps calorie
            timestamp: new Date(`${today}T12:00:00`).getTime(), // noon
            details: { durationMinutes: 0 }
        };
        handleAddLog(stepsLog, false); // Don't navigate away
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.connectedServices, loading]); // Run on load and when services change

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('cp_profile', JSON.stringify(newProfile));
    if(activeTab === 'profile') {
        handleNavigate('dashboard');
    }
  };

  const handleAddLog = (log: LogEntry, shouldNavigate = true) => {
    const updatedLogs = [...logs, log];
    setLogs(updatedLogs);
    localStorage.setItem('cp_logs', JSON.stringify(updatedLogs));
    if (shouldNavigate) {
      handleNavigate('dashboard');
    }
  };
  
  const handleNavigate = (tab: string, params: any = {}) => {
    setActiveTab(tab);
    setNavParams(params);
    window.scrollTo(0, 0);
  };
  
  const handleOnboardingComplete = (profile: UserProfile) => {
      handleSaveProfile(profile);
      setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
      sessionStorage.setItem('cp_skip_onboarding', 'true');
      setShowOnboarding(false);
  };

  const handleLogout = () => {
      localStorage.removeItem('cp_profile');
      localStorage.removeItem('cp_logs');
      sessionStorage.removeItem('cp_skip_onboarding');
      setUserProfile(DEFAULT_PROFILE);
      setLogs([]);
      setActiveTab('dashboard');
      setShowOnboarding(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PageLayout><Dashboard logs={logs} userProfile={userProfile} onNavigate={handleNavigate} /></PageLayout>;
      case 'food':
        return <PageLayout><FoodLogger 
                  onAddLog={handleAddLog} 
                  onCancel={() => handleNavigate('dashboard')} 
                  initialText={navParams.initialText}
                  initialMode={navParams.initialMode}
                  recentLogs={logs}
                  userProfile={userProfile}
               /></PageLayout>;
      case 'exercise':
        return <PageLayout><ExerciseLogger 
                  onAddLog={handleAddLog} 
                  onCancel={() => handleNavigate('dashboard')} 
                  initialText={navParams.initialText}
                  userProfile={userProfile}
                /></PageLayout>;
      case 'history':
        return <PageLayout><MealHistory logs={logs} /></PageLayout>;
      case 'profile':
        return <PageLayout><ProfileSettings profile={userProfile} onSave={handleSaveProfile} /></PageLayout>;
      default:
        return <PageLayout><Dashboard logs={logs} userProfile={userProfile} onNavigate={handleNavigate} /></PageLayout>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-brand-dark font-bold">Loading CalorieProfile...</div>
      </div>
    );
  }

  if (showOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} initialProfile={userProfile} />;
  }

  const Header = () => (
    <header className="md:hidden sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10 px-4 py-3 border-b border-brand-gray flex justify-between items-center">
      <div className="font-black text-lg text-brand-blue uppercase tracking-tighter">{APP_NAME}</div>
      <button onClick={handleLogout} className="text-slate-500 hover:text-brand-red"><LogOut size={20}/></button>
    </header>
  );

  const BottomNav = () => (
     <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10 grid grid-cols-5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors ${
              activeTab === item.id ? 'text-brand-red' : 'text-slate-400 hover:bg-red-50'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
  );

  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-gray p-6">
        <div className="font-black text-2xl text-brand-blue uppercase tracking-tighter mb-12">{APP_NAME}</div>
        <nav className="flex flex-col gap-3 flex-1">
            {NAV_ITEMS.map(item => (
                 <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-4 p-3 rounded-md text-sm font-bold transition-colors ${
                    activeTab === item.id 
                        ? 'bg-brand-blue text-white shadow-md' 
                        : 'text-slate-500 hover:bg-brand-bg'
                    }`}
                >
                    <item.icon size={20} />
                    <span className="uppercase tracking-wide">{item.label}</span>
                </button>
            ))}
        </nav>
        <div className="border-t border-brand-gray pt-4">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                     {userProfile.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                     <p className="font-bold text-sm text-brand-dark">{userProfile.name}</p>
                     <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-brand-red">Sign Out</button>
                 </div>
             </div>
        </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {renderContent()}
            </div>
          </main>
          <BottomNav />
      </div>
    </div>
  );
}