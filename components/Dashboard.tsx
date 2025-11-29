import React, { useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType, UserProfile } from '../types';
import { getTodayDateString } from '../constants';
import { Card, Input, Button } from './UIComponents';
import { Camera, Upload, History, ChevronRight, Zap, AlertCircle, X, HeartPulse } from 'lucide-react';
import { getDailyQuote } from '../services/geminiService';

interface DashboardProps {
  logs: LogEntry[];
  userProfile: UserProfile;
  onNavigate: (tab: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, userProfile, onNavigate }) => {
  const [quickFood, setQuickFood] = useState('');
  const [quickExercise, setQuickExercise] = useState('');
  const [showBanner, setShowBanner] = useState(!userProfile.onboardingComplete);
  const [dailyQuote, setDailyQuote] = useState('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
        setIsQuoteLoading(true);
        const today = getTodayDateString();
        const storedQuoteData = localStorage.getItem('daily_quote');
        if (storedQuoteData) {
            const { quote, date } = JSON.parse(storedQuoteData);
            if (date === today) {
                setDailyQuote(quote);
                setIsQuoteLoading(false);
                return;
            }
        }
        const newQuote = await getDailyQuote();
        setDailyQuote(newQuote);
        localStorage.setItem('daily_quote', JSON.stringify({ quote: newQuote, date: today }));
        setIsQuoteLoading(false);
    };

    fetchQuote();
  }, []);

  const today = getTodayDateString();

  const todayLogs = useMemo(() => {
    return logs.filter(log => {
      const date = new Date(log.timestamp);
      return date.toISOString().split('T')[0] === today;
    });
  }, [logs, today]);

  const stats = useMemo(() => {
    const caloriesIn = todayLogs
      .filter(l => l.type === LogType.FOOD)
      .reduce((acc, curr) => acc + curr.calories, 0);

    const caloriesOut = todayLogs
      .filter(l => l.type === LogType.EXERCISE)
      .reduce((acc, curr) => acc + curr.calories, 0);

    const protein = todayLogs
      .filter(l => l.type === LogType.FOOD)
      .reduce((acc, curr) => acc + (curr.details?.protein || 0), 0);

    const carbs = todayLogs
      .filter(l => l.type === LogType.FOOD)
      .reduce((acc, curr) => acc + (curr.details?.carbs || 0), 0);

    const fat = todayLogs
      .filter(l => l.type === LogType.FOOD)
      .reduce((acc, curr) => acc + (curr.details?.fat || 0), 0);

    const net = caloriesIn - caloriesOut;
    const remaining = userProfile.dailyCalorieGoal - net;
    const percent = Math.min(100, Math.max(0, (net / userProfile.dailyCalorieGoal) * 100));

    return { caloriesIn, caloriesOut, net, remaining, percent, protein, carbs, fat };
  }, [todayLogs, userProfile.dailyCalorieGoal]);

  const handleQuickFood = () => {
    if (quickFood.trim()) {
      onNavigate('food', { initialText: quickFood });
    } else {
      onNavigate('food');
    }
  };

  const handleQuickExercise = () => {
    if (quickExercise.trim()) {
      onNavigate('exercise', { initialText: quickExercise });
    } else {
      onNavigate('exercise');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-brand-dark uppercase tracking-tight">
          HELLO, {userProfile.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
          TODAY: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Daily Quote moved here */}
        <div className="pt-2">
          {isQuoteLoading ? (
            <div className="h-5 w-3/4 max-w-sm rounded bg-slate-200 animate-pulse"></div>
          ) : (
            <p className="font-medium text-slate-600 italic">"{dailyQuote}"</p>
          )}
        </div>

         {userProfile.connectedServices.length > 0 && (
            <div className="mt-2 text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-2 animate-in fade-in duration-500">
                <HeartPulse size={14} />
                <span>Syncing from {userProfile.connectedServices.join(', ')}</span>
            </div>
        )}
      </div>

      {/* Onboarding Reminder Banner */}
      {showBanner && !userProfile.onboardingComplete && (
        <div className="bg-brand-blue text-white rounded-lg p-5 flex items-start justify-between shadow-hard border border-brand-dark">
           <div className="flex gap-4">
              <div className="p-2 bg-white/20 rounded-md h-fit">
                 <AlertCircle size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-lg">Setup Required</h3>
                 <p className="text-white/90 text-sm mt-1 mb-3 leading-relaxed font-medium">
                    Add your physical stats to unlock personalized AI recommendations.
                 </p>
                 <Button 
                    size="sm" 
                    onClick={() => onNavigate('profile')}
                    className="bg-brand-accent text-brand-dark hover:bg-yellow-400 border-none"
                 >
                    Complete Profile
                 </Button>
              </div>
           </div>
           <button onClick={() => setShowBanner(false)} className="text-white/60 hover:text-white">
              <X size={20} />
           </button>
        </div>
      )}

      {/* Quick Entry Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-brand-gray shadow-sm">
          <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">ADD MEAL</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., '2 eggs, toast'"
              value={quickFood}
              onChange={(e) => setQuickFood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickFood()}
              className="bg-brand-bg"
            />
            <Button onClick={handleQuickFood} className="whitespace-nowrap bg-brand-red hover:bg-red-600">
              ADD
            </Button>
            <Button 
              onClick={() => onNavigate('food', { initialMode: 'camera' })} 
              className="px-3 bg-brand-dark text-white hover:bg-black"
              title="Scan Meal Photo"
            >
              <Camera size={20} />
            </Button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-brand-gray shadow-sm">
          <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">ADD EXERCISE</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., 'Run 5k'"
              value={quickExercise}
              onChange={(e) => setQuickExercise(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickExercise()}
              className="bg-brand-bg"
            />
            <Button onClick={handleQuickExercise} variant="secondary" className="whitespace-nowrap">
              ADD
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Progress Circle */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-gray p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>
           <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wide mb-8">Daily Target</h2>
        
            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Circle Chart - Updated radius and viewBox to prevent clipping */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="84" 
                    stroke="#E5E5E5"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#E0523D"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - stats.percent / 100)}
                    strokeLinecap="butt"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-brand-dark tracking-tighter">{stats.net}</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">NET CALS</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full md:w-auto">
                 <div className="flex items-center justify-between md:block md:text-left border-b border-brand-gray md:border-none pb-2 md:pb-0">
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">CONSUMED</div>
                   <div className="text-brand-dark font-bold text-2xl">{stats.caloriesIn}</div>
                 </div>
                 <div className="flex items-center justify-between md:block md:text-left border-b border-brand-gray md:border-none pb-2 md:pb-0">
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">BURNED</div>
                   <div className="text-brand-blue font-bold text-2xl">-{stats.caloriesOut}</div>
                 </div>
                 <div className="flex items-center justify-between md:block md:text-left">
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">GOAL</div>
                   <div className="text-slate-400 font-bold text-2xl">{userProfile.dailyCalorieGoal}</div>
                 </div>
              </div>
            </div>

            <div className="mt-8 text-center md:text-left">
                 <span className="inline-block bg-brand-bg text-brand-dark font-bold text-sm px-4 py-2 rounded-md border border-brand-gray uppercase">
                    {stats.remaining > 0 
                      ? `${stats.remaining} KCAL REMAINING` 
                      : `${Math.abs(stats.remaining)} KCAL OVER`
                    }
                 </span>
            </div>
        </div>

        {/* Macros Vertical Stack */}
        <div className="space-y-4">
           <Card className="p-5 border-l-4 border-l-brand-red border-t border-r border-b border-brand-gray rounded-r-lg rounded-l-none">
             <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Protein</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-brand-dark">{stats.protein}g</span>
                        <span className="font-bold text-slate-400">/ {userProfile.proteinGoal}g</span>
                    </div>
                </div>
                <div className="text-xs font-medium text-brand-red">{userProfile.proteinGoal > 0 ? Math.round((stats.protein / userProfile.proteinGoal) * 100) : 0}%</div>
             </div>
             <div className="mt-3 w-full bg-brand-bg h-2 rounded-full overflow-hidden">
               <div className="h-full bg-brand-red" style={{ width: `${userProfile.proteinGoal > 0 ? Math.min(100, (stats.protein / userProfile.proteinGoal) * 100) : 0}%` }}></div>
             </div>
           </Card>
           
           <Card className="p-5 border-l-4 border-l-brand-blue border-t border-r border-b border-brand-gray rounded-r-lg rounded-l-none">
             <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Carbs</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-brand-dark">{stats.carbs}g</span>
                        <span className="font-bold text-slate-400">/ {userProfile.carbsGoal}g</span>
                    </div>
                </div>
                <div className="text-xs font-medium text-brand-blue">{userProfile.carbsGoal > 0 ? Math.round((stats.carbs / userProfile.carbsGoal) * 100) : 0}%</div>
             </div>
             <div className="mt-3 w-full bg-brand-bg h-2 rounded-full overflow-hidden">
               <div className="h-full bg-brand-blue" style={{ width: `${userProfile.carbsGoal > 0 ? Math.min(100, (stats.carbs / userProfile.carbsGoal) * 100) : 0}%` }}></div>
             </div>
           </Card>

           <Card className="p-5 border-l-4 border-l-brand-accent border-t border-r border-b border-brand-gray rounded-r-lg rounded-l-none">
             <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fat</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-brand-dark">{stats.fat}g</span>
                        <span className="font-bold text-slate-400">/ {userProfile.fatGoal}g</span>
                    </div>
                </div>
                <div className="text-xs font-medium text-brand-accent">{userProfile.fatGoal > 0 ? Math.round((stats.fat / userProfile.fatGoal) * 100) : 0}%</div>
             </div>
             <div className="mt-3 w-full bg-brand-bg h-2 rounded-full overflow-hidden">
               <div className="h-full bg-brand-accent" style={{ width: `${userProfile.fatGoal > 0 ? Math.min(100, (stats.fat / userProfile.fatGoal) * 100) : 0}%` }}></div>
             </div>
           </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate('food', { initialMode: 'camera' })}
            className="flex flex-col items-center justify-center p-6 bg-white border border-brand-gray rounded-lg hover:border-brand-red hover:bg-red-50 transition-all group"
          >
            <Camera size={28} className="text-brand-red mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">Photo</span>
          </button>

          <button 
             onClick={() => onNavigate('food', { initialMode: 'camera' })} 
             className="flex flex-col items-center justify-center p-6 bg-white border border-brand-gray rounded-lg hover:border-brand-blue hover:bg-sky-50 transition-all group"
          >
            <Upload size={28} className="text-brand-blue mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">Upload</span>
          </button>

          <button 
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-brand-gray rounded-lg hover:border-brand-dark hover:bg-gray-50 transition-all group"
          >
            <History size={28} className="text-brand-dark mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">History</span>
          </button>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="bg-white rounded-lg border border-brand-gray p-6">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wide">Timeline</h2>
           <button onClick={() => onNavigate('history')} className="text-brand-blue text-xs font-bold uppercase tracking-wider flex items-center hover:underline">
             View All <ChevronRight size={16} />
           </button>
         </div>
         
         {todayLogs.length === 0 ? (
           <div className="text-center py-8 border-2 border-dashed border-brand-gray rounded-lg">
              <Zap size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 font-medium text-sm uppercase tracking-wide">No activity yet</p>
           </div>
         ) : (
           <div className="space-y-0">
             {todayLogs.slice().reverse().map((log, index) => (
               <div key={log.id} className="flex gap-4 items-center py-4 border-b border-brand-gray last:border-0">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${log.type === LogType.FOOD ? 'bg-brand-red' : 'bg-brand-blue'}`}>
                    {log.type === LogType.FOOD ? 'IN' : 'OUT'}
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-brand-dark text-sm">{log.name}</p>
                   <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap text-xs text-slate-400 mt-1">
                     <span className="font-medium uppercase tracking-wider">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {log.type === LogType.FOOD && log.details && (
                        <span className="text-[11px] font-medium text-slate-500">
                            P: {log.details.protein || 0}g &bull; C: {log.details.carbs || 0}g &bull; F: {log.details.fat || 0}g
                        </span>
                      )}
                   </div>
                 </div>
                 <div className={`font-black text-lg ${log.type === LogType.FOOD ? 'text-brand-dark' : 'text-brand-blue'}`}>
                   {log.type === LogType.FOOD ? '+' : '-'}{log.calories}
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};