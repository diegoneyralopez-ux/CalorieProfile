import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Select } from './UIComponents';
import { analyzeFoodText, analyzeFoodImage, analyzeExerciseText } from '../services/geminiService';
import { LogEntry, LogType, FoodAnalysisResult, ExerciseAnalysisResult, MealType, UserProfile } from '../types';
import { ArrowRight, Check, PlusCircle, X, Camera, RefreshCcw, Image as ImageIcon, Sparkles, Utensils, Smartphone } from 'lucide-react';
import { getTodayDateString } from '../constants';

const generateId = () => Math.random().toString(36).substring(2, 15);

interface LoggerProps {
  onAddLog: (log: LogEntry) => void;
  onCancel: () => void;
  initialText?: string;
  initialMode?: 'text' | 'camera';
  recentLogs?: LogEntry[]; // Passed to show recent entries
  userProfile?: UserProfile;
}

export const FoodLogger: React.FC<LoggerProps> = ({ onAddLog, onCancel, initialText = '', initialMode = 'text', recentLogs = [] }) => {
  const [input, setInput] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(initialMode === 'camera');
  const [mealType, setMealType] = useState<MealType>(MealType.BREAKFAST);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-analyze if initial text is provided
  useEffect(() => {
    if (initialText && !analysis && !isAnalyzing) {
      handleAnalyzeText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  // Determine meal type based on time of day if not set
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealType(MealType.BREAKFAST);
    else if (hour < 15) setMealType(MealType.LUNCH);
    else if (hour < 18) setMealType(MealType.SNACK);
    else setMealType(MealType.DINNER);
  }, []);

  useEffect(() => {
    if (isCameraOpen) {
        startCamera();
    } else {
        stopCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    stopCamera();
    setIsCameraOpen(false);
    setIsAnalyzing(true);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = dataUrl.split(',')[1];

    const result = await analyzeFoodImage(base64Data);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleAnalyzeText = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeFoodText(input);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleConfirm = () => {
    if (!analysis) return;
    const newLog: LogEntry = {
      id: generateId(),
      type: LogType.FOOD,
      name: analysis.foodName,
      calories: analysis.calories,
      timestamp: Date.now(),
      mealType: mealType,
      details: {
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
      }
    };
    onAddLog(newLog);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Add Food</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AI Analysis</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-brand-red transition-colors">
          <X size={24} />
        </button>
      </div>

      {!analysis ? (
        isCameraOpen ? (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
             <div className="relative flex-1">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                    <span className="text-white font-medium tracking-wide uppercase text-sm">Scan your meal</span>
                    <button onClick={() => setIsCameraOpen(false)} className="text-white p-2"><X size={24}/></button>
                </div>
             </div>
             <div className="bg-brand-dark p-8 flex justify-center gap-8 items-center pb-12">
                <button onClick={() => setIsCameraOpen(false)} className="text-white opacity-60 text-xs font-bold uppercase">Cancel</button>
                <button onClick={captureAndAnalyze} className="w-16 h-16 rounded-full bg-white border-4 border-slate-400 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                    <div className="w-12 h-12 rounded-full bg-brand-red border-2 border-white"></div>
                </button>
                <button className="text-white opacity-60 text-xs font-bold uppercase">Gallery</button>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="space-y-4 border-brand-gray shadow-sm">
                <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">What did you eat?</label>
                    <Input
                        placeholder="e.g., '2 eggs, 1 slice of toast'"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Meal Type</label>
                    <Select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                        <option value={MealType.BREAKFAST}>Breakfast</option>
                        <option value={MealType.LUNCH}>Lunch</option>
                        <option value={MealType.DINNER}>Dinner</option>
                        <option value={MealType.SNACK}>Snack</option>
                    </Select>
                </div>

                <Button onClick={handleAnalyzeText} isLoading={isAnalyzing} disabled={!input} className="w-full bg-brand-red hover:bg-red-600">
                  Analyze
                </Button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-brand-gray"></div>
                    <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">Or</span>
                    <div className="flex-grow border-t border-brand-gray"></div>
                </div>

                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsCameraOpen(true)}
                >
                    <Camera size={18} />
                    Use Camera
                </Button>
            </Card>

            <div className="bg-white border border-brand-blue rounded-lg p-4 flex gap-3 items-start">
                <div className="p-1 bg-brand-blue text-white rounded-full">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">Pro Tip</h4>
                  <p className="text-xs text-slate-600">Include quantities like "1 cup" or "100g" for better precision.</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Recent</h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getTodayDateString()}</div>
                </div>
                
                {recentLogs.filter(l => l.type === LogType.FOOD).length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-brand-gray rounded-lg">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">No meals yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                         {recentLogs.filter(l => l.type === LogType.FOOD).slice(0, 3).map(log => (
                             <div key={log.id} className="bg-white p-3 rounded-lg border border-brand-gray flex justify-between items-center">
                                 <div>
                                     <p className="font-bold text-brand-dark text-sm">{log.name}</p>
                                     <p className="text-xs text-slate-400 font-medium uppercase">{log.mealType || 'Meal'}</p>
                                 </div>
                                 <span className="text-brand-red font-bold text-sm">{log.calories}</span>
                             </div>
                         ))}
                    </div>
                )}
            </div>
          </div>
        )
      ) : (
        <div className="space-y-6">
            <Card className="border-brand-dark shadow-hard bg-white">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-red text-white mb-4">
                   <Utensils size={24} />
                </div>
                <h3 className="font-black text-2xl text-brand-dark mb-1 uppercase tracking-tight">{analysis.foodName}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">AI Estimate</p>
                
                <div className="border-y border-brand-gray py-4">
                    <p className="text-5xl font-black text-brand-dark">{analysis.calories}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Calories</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-brand-gray rounded-md overflow-hidden mb-6">
                <div className="bg-brand-bg p-3 text-center border-r border-brand-gray">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Protein</p>
                  <p className="font-bold text-brand-dark">{analysis.protein}g</p>
                </div>
                <div className="bg-brand-bg p-3 text-center border-r border-brand-gray">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Carbs</p>
                  <p className="font-bold text-brand-dark">{analysis.carbs}g</p>
                </div>
                <div className="bg-brand-bg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Fat</p>
                  <p className="font-bold text-brand-dark">{analysis.fat}g</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAnalysis(null)} className="flex-1">
                   Retry
                </Button>
                <Button onClick={handleConfirm} className="flex-1 bg-brand-red hover:bg-red-700 text-white">
                   Save Log
                </Button>
              </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export const ExerciseLogger: React.FC<LoggerProps> = ({ onAddLog, onCancel, initialText = '', userProfile }) => {
  const [input, setInput] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ExerciseAnalysisResult | null>(null);

  useEffect(() => {
    if (initialText && !analysis && !isAnalyzing) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeExerciseText(input);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleConfirm = () => {
    if (!analysis) return;
    const newLog: LogEntry = {
      id: generateId(),
      type: LogType.EXERCISE,
      name: analysis.activityName,
      calories: analysis.caloriesBurned,
      timestamp: Date.now(),
      details: {
        durationMinutes: analysis.durationMinutes
      }
    };
    onAddLog(newLog);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Log Activity</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Burn Calories</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-brand-blue">
          <X size={24} />
        </button>
      </div>

       {userProfile && userProfile.connectedServices.length > 0 && (
        <div className="mb-4 bg-brand-bg border border-brand-blue rounded-lg p-4 flex gap-3 items-start">
            <div className="p-1 bg-brand-blue text-white rounded-full">
                <Smartphone size={14} />
            </div>
            <div>
                <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">Auto-Sync is Active</h4>
                <p className="text-xs text-slate-600">
                    Your workouts and steps from connected services will be added automatically.
                </p>
            </div>
        </div>
      )}

      {!analysis ? (
        <Card className="border-brand-gray">
          <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Activity</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Ran 5k in 30 mins"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} isLoading={isAnalyzing} disabled={!input} className="bg-brand-blue hover:bg-sky-600">
              <ArrowRight size={20} />
            </Button>
          </div>
           <p className="text-xs text-slate-400 mt-3 font-medium">
            Duration matters for accuracy.
          </p>
        </Card>
      ) : (
        <Card className="border-brand-blue shadow-hard">
           <div className="text-center mb-6">
            <div className="bg-brand-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <PlusCircle size={28} />
            </div>
            <h3 className="font-black text-xl text-brand-dark uppercase">{analysis.activityName}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{analysis.durationMinutes} mins</p>
            
            <div className="border-t border-b border-brand-blue/20 py-4 bg-sky-50">
                 <p className="text-4xl font-black text-brand-blue">{analysis.caloriesBurned}</p>
                 <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mt-1">Calories Burned</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAnalysis(null)} className="flex-1">
              Retry
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-brand-blue hover:bg-sky-600 text-white">
               Log It
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};