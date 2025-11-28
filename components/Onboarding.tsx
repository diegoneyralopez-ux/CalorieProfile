import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Button, Input, Select, Card } from './UIComponents';
import { calculateNutritionalGoals } from '../constants';
import { ArrowRight, X, Target, Activity, User, CheckCircle, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
  initialProfile: UserProfile;
}

const activityLevels = {
    'Sedentary': 'Little to no exercise.',
    'Light': 'Light exercise/sports 1-3 days/week.',
    'Moderate': 'Moderate exercise/sports 3-5 days/week.',
    'Very Active': 'Hard exercise 6-7 days a week.'
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip, initialProfile }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>({
    ...initialProfile,
    name: '', // Reset generic defaults for fresh input
    weight: 0,
    height: 0,
    age: 0
  });

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [lbs, setLbs] = useState<number | ''>('');
  const [feet, setFeet] = useState<number | ''>('');
  const [inches, setInches] = useState<number | ''>('');

  // Sync from metric (formData) to imperial (local state) when system changes or metric values are programmatically updated
  useEffect(() => {
    if (unitSystem === 'imperial') {
        if (formData.weight > 0) {
            setLbs(Math.round(formData.weight * 2.20462));
        } else {
            setLbs('');
        }
        if (formData.height > 0) {
            const totalInches = formData.height / 2.54;
            setFeet(Math.floor(totalInches / 12));
            setInches(Math.round(totalInches % 12));
        } else {
            setFeet('');
            setInches('');
        }
    }
  }, [unitSystem, formData.weight, formData.height]);

  const handleLbsChange = (value: string) => {
    const numValue = parseFloat(value);
    setLbs(value === '' ? '' : numValue);
    if (!isNaN(numValue) && numValue > 0) {
        handleChange('weight', numValue / 2.20462);
    } else {
        handleChange('weight', 0);
    }
  };

  const handleImperialHeightChange = (newFeetStr: string, newInchesStr: string) => {
    const newFeet = newFeetStr === '' ? '' : parseFloat(newFeetStr) || 0;
    const newInches = newInchesStr === '' ? '' : parseFloat(newInchesStr) || 0;
    
    setFeet(newFeet);
    setInches(newInches);

    const ftVal = typeof newFeet === 'number' ? newFeet : 0;
    const inVal = typeof newInches === 'number' ? newInches : 0;
    
    const totalInches = (ftVal * 12) + inVal;
    if (totalInches > 0) {
        handleChange('height', totalInches * 2.54);
    } else {
        handleChange('height', 0);
    }
  };

  const handleNext = () => {
    if (step === 3) {
        // Final Calculation before saving
        const goals = calculateNutritionalGoals(
            formData.weight,
            formData.height,
            formData.age,
            formData.gender,
            formData.activityLevel,
            formData.fitnessGoal
        );
        
        const finalProfile = {
            ...formData,
            ...goals,
            onboardingComplete: true
        };
        onComplete(finalProfile);
    } else {
        setStep(prev => prev + 1);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
      if (step === 1) return formData.name.trim().length > 0;
      if (step === 2) return formData.weight > 0 && formData.height > 0 && formData.age > 0;
      return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-brand-gray">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-gray flex justify-between items-center bg-brand-bg">
            <div className="flex gap-1 items-center">
                 <span className="font-black text-brand-blue uppercase tracking-tighter">NutriTrack Setup</span>
            </div>
            <button onClick={onSkip} className="text-slate-400 hover:text-brand-red text-xs font-bold uppercase tracking-wide">
                Skip
            </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-brand-gray flex">
            <div className="h-full bg-brand-red transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1">
            {step === 0 && (
                <div className="text-center py-8 space-y-6">
                    <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mx-auto text-white shadow-hard border-2 border-brand-dark">
                        <Target size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight mb-2">Welcome</h2>
                        <p className="text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                            Configure your profile to get tailored goals and AI insights.
                        </p>
                    </div>
                    <div className="bg-brand-bg border border-brand-gray p-6 rounded-lg text-sm text-brand-dark text-left mx-auto max-w-xs shadow-sm">
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-center font-bold"><div className="w-2 h-2 bg-brand-blue rounded-full"></div> Custom Calories</li>
                            <li className="flex gap-3 items-center font-bold"><div className="w-2 h-2 bg-brand-blue rounded-full"></div> Macro Split</li>
                            <li className="flex gap-3 items-center font-bold"><div className="w-2 h-2 bg-brand-blue rounded-full"></div> AI Coaching</li>
                        </ul>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8 py-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Who are you?</h2>
                    </div>
                    <Input 
                        placeholder="ENTER NAME" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        autoFocus
                        className="text-2xl text-center font-black uppercase tracking-wide h-16 border-2 border-brand-dark focus:border-brand-red"
                    />
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="text-center mb-2">
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Your Stats</h2>
                    </div>

                    <div className="flex justify-end">
                        <div className="flex border-2 border-brand-gray rounded-md p-0.5">
                            <button 
                                onClick={() => setUnitSystem('metric')} 
                                className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${unitSystem === 'metric' ? 'bg-brand-dark text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                                METRIC
                            </button>
                            <button 
                                onClick={() => setUnitSystem('imperial')} 
                                className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${unitSystem === 'imperial' ? 'bg-brand-dark text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                                IMPERIAL
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        {unitSystem === 'metric' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Weight (kg)</label>
                                    <Input 
                                        type="number" 
                                        placeholder="75"
                                        value={formData.weight || ''}
                                        onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                                        className="text-center font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Height (cm)</label>
                                    <Input 
                                        type="number" 
                                        placeholder="175"
                                        value={formData.height || ''}
                                        onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
                                        className="text-center font-bold"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Weight (lbs)</label>
                                    <Input 
                                        type="number" 
                                        placeholder="165"
                                        value={lbs}
                                        onChange={(e) => handleLbsChange(e.target.value)}
                                        className="text-center font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Height (ft, in)</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="5"
                                            value={feet}
                                            onChange={(e) => handleImperialHeightChange(e.target.value, String(inches))}
                                            className="text-center font-bold"
                                        />
                                        <Input 
                                            type="number" 
                                            placeholder="9"
                                            value={inches}
                                            onChange={(e) => handleImperialHeightChange(String(feet), e.target.value)}
                                            className="text-center font-bold"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div>
                            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Age</label>
                            <Input 
                                type="number" 
                                placeholder="25"
                                value={formData.age || ''}
                                onChange={(e) => handleChange('age', parseFloat(e.target.value) || 0)}
                                className="text-center font-bold"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Gender</label>
                             <Select 
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="font-bold"
                            >
                                <option value="Not specified">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <div className="text-center mb-2">
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Your Mission</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Activity Level</label>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(activityLevels).map(([level, description]) => (
                                    <button
                                        key={level}
                                        onClick={() => handleChange('activityLevel', level)}
                                        className={`p-4 rounded-md border-2 text-left transition-all ${
                                            formData.activityLevel === level 
                                            ? 'border-brand-blue bg-brand-blue text-white shadow-md' 
                                            : 'bg-white border-brand-gray hover:border-brand-blue text-brand-dark'
                                        }`}
                                    >
                                        <span className="font-bold uppercase tracking-wide text-sm">{level}</span>
                                        <p className={`text-xs mt-1 transition-colors ${formData.activityLevel === level ? 'text-white/80' : 'text-slate-500 font-medium'}`}>{description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Goal</label>
                             <div className="flex gap-2">
                                {['Lose Weight', 'Maintain', 'Gain Muscle'].map(goal => (
                                    <button
                                        key={goal}
                                        onClick={() => handleChange('fitnessGoal', goal)}
                                        className={`flex-1 p-3 text-[10px] font-bold rounded-md border-2 transition-all uppercase ${
                                            formData.fitnessGoal === goal 
                                            ? 'bg-brand-dark text-white border-brand-dark' 
                                            : 'bg-white text-slate-500 border-brand-gray hover:border-brand-dark'
                                        }`}
                                    >
                                        {goal}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-gray bg-brand-bg flex justify-between items-center">
            {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-slate-400 font-bold text-xs uppercase tracking-wide hover:text-brand-dark">
                    Back
                </button>
            ) : (
                <div></div>
            )}
            
            <Button 
                onClick={handleNext} 
                disabled={!canProceed()} 
                className="px-8 bg-brand-red hover:bg-red-700 text-white shadow-hard border-2 border-brand-dark"
            >
                {step === 3 ? 'Finish' : 'Next'} 
            </Button>
        </div>
      </div>
    </div>
  );
};