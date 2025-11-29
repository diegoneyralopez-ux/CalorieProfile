import React, { useMemo } from 'react';
import { LogEntry, LogType, MealType } from '../types';
import { Card } from './UIComponents';
import { Calendar, Zap, Utensils, BarChart3, Search } from 'lucide-react';
import { Input } from './UIComponents';

interface MealHistoryProps {
  logs: LogEntry[];
}

export const MealHistory: React.FC<MealHistoryProps> = ({ logs }) => {
  const foodLogs = useMemo(() => logs.filter(l => l.type === LogType.FOOD), [logs]);
  
  const stats = useMemo(() => {
    if (foodLogs.length === 0) return { avgCals: 0, avgProtein: 0, totalMeals: 0, daysTracked: 0 };
    
    const totalCals = foodLogs.reduce((acc, l) => acc + l.calories, 0);
    const totalProtein = foodLogs.reduce((acc, l) => acc + (l.details?.protein || 0), 0);
    const uniqueDays = new Set(foodLogs.map(l => new Date(l.timestamp).toDateString())).size;
    
    const divisor = uniqueDays || 1;
    
    return {
        avgCals: Math.round(totalCals / divisor),
        avgProtein: Math.round(totalProtein / divisor),
        totalMeals: foodLogs.length,
        daysTracked: uniqueDays
    };
  }, [foodLogs]);

  const groupedLogs = useMemo(() => {
    const groups: {[key: string]: LogEntry[]} = {};
    logs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
    });
    return groups;
  }, [logs]);

  const frequentFoods = useMemo(() => {
      const counts: {[key: string]: number} = {};
      foodLogs.forEach(l => {
          counts[l.name] = (counts[l.name] || 0) + 1;
      });
      return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
  }, [foodLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight">History</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Past Meals</p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-white border border-brand-gray rounded-md py-2 px-4 text-sm font-bold text-brand-dark flex items-center justify-center gap-2 hover:bg-slate-50 uppercase tracking-wide">
             Refresh
        </button>
        <button className="flex-1 bg-brand-red text-white rounded-md py-2 px-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 uppercase tracking-wide">
            Log Meal
        </button>
      </div>

      {/* Weekly Summary */}
      <div>
        <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wide">7 Day Recap</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-b-4 border-b-brand-red">
                <div className="text-3xl font-black text-brand-dark">{stats.avgCals}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Cals</div>
            </Card>
            <Card className="p-4 border-b-4 border-b-brand-blue">
                <div className="text-3xl font-black text-brand-dark">{stats.totalMeals}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Meals</div>
            </Card>
            <Card className="p-4 border-b-4 border-b-brand-dark">
                <div className="text-3xl font-black text-brand-dark">{stats.avgProtein}g</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Protein</div>
            </Card>
            <Card className="p-4 border-b-4 border-b-brand-accent">
                <div className="text-3xl font-black text-brand-dark">{stats.daysTracked}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Streak</div>
            </Card>
        </div>
      </div>

      {/* Frequent Foods */}
      {frequentFoods.length > 0 && (
        <Card>
            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Top Foods</h3>
            <div className="space-y-4">
                {frequentFoods.map(([name, count], idx) => (
                    <div key={name} className="flex items-center justify-between border-b border-brand-gray last:border-0 pb-2">
                        <div className="flex items-center gap-4">
                            <div className="text-lg font-black text-brand-blue w-6">0{idx + 1}</div>
                            <div>
                                <div className="font-bold text-brand-dark text-sm uppercase">{name}</div>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-slate-400">{count}x</div>
                    </div>
                ))}
            </div>
        </Card>
      )}

      {/* Daily List */}
      <div className="space-y-8">
        {Object.entries(groupedLogs).sort((a,b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, dayLogs]: [string, LogEntry[]]) => (
            <div key={date}>
                <h3 className="text-lg font-black text-brand-dark mb-4 uppercase tracking-tight">{date}</h3>
                <div className="space-y-3">
                    {dayLogs.map(log => (
                        <div key={log.id} className="bg-white border border-brand-gray rounded-lg overflow-hidden flex shadow-sm">
                            <div className={`w-2 ${log.type === LogType.FOOD ? 'bg-brand-red' : 'bg-brand-blue'}`}></div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm uppercase tracking-wide">{log.name}</h4>
                                        <div className="flex gap-2 mt-1">
                                            {log.mealType && <span className="text-[10px] font-bold bg-brand-bg text-brand-dark px-2 py-1 rounded uppercase">{log.mealType}</span>}
                                            <span className="text-xs text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-black text-lg ${log.type === LogType.FOOD ? 'text-brand-dark' : 'text-brand-blue'}`}>
                                            {log.type === LogType.EXERCISE ? '-' : ''}{log.calories}
                                        </div>
                                    </div>
                                </div>
                                {log.type === LogType.FOOD && log.details && (
                                    <div className="mt-3 pt-3 border-t border-brand-gray/50 flex justify-around text-center">
                                        <div>
                                            <p className="font-bold text-brand-dark text-sm">{log.details.protein || 0}g</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Protein</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-dark text-sm">{log.details.carbs || 0}g</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Carbs</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-dark text-sm">{log.details.fat || 0}g</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Fat</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};