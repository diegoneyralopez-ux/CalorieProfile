import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from './UIComponents';
import { UserProfile } from '../types';
import { Save, User, Activity, Target, Link } from 'lucide-react';
import { INTEGRATION_SERVICES, calculateNutritionalGoals } from '../constants';


interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [bmi, setBmi] = useState<number>(0);

  useEffect(() => {
    if (formData.height && formData.weight) {
      const hM = formData.height / 100;
      const b = formData.weight / (hM * hM);
      setBmi(parseFloat(b.toFixed(1)));
    }
  }, [formData.height, formData.weight]);

  // Auto-recalculate goals when stats change
  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0 && formData.age > 0) {
      const goals = calculateNutritionalGoals(
        formData.weight,
        formData.height,
        formData.age,
        formData.gender,
        formData.activityLevel,
        formData.fitnessGoal
      );
      setFormData(prev => ({ ...prev, ...goals }));
    }
}, [formData.weight, formData.height, formData.age, formData.gender, formData.activityLevel, formData.fitnessGoal]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, onboardingComplete: true });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Profile</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Your Stats</p>
        </div>
        <Button onClick={handleSave} size="sm" className="bg-brand-dark text-white hover:bg-black">Save Changes</Button>
      </div>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} /> Basic
            </h3>
            <Card className="grid gap-4">
                <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Full Name</label>
                    <Input 
                        value={formData.name} 
                        onChange={(e) => handleChange('name', e.target.value)} 
                        placeholder="Demo User"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Email</label>
                    <Input 
                        value={formData.email} 
                        disabled
                        className="bg-slate-50 text-slate-500 border-transparent"
                    />
                </div>
            </Card>
        </section>

        {/* Physical Stats */}
        <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity size={14} /> Stats
            </h3>
            <Card className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Weight (kg)</label>
                        <Input 
                            type="number"
                            value={formData.weight} 
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value))} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Height (cm)</label>
                        <Input 
                            type="number"
                            value={formData.height} 
                            onChange={(e) => handleChange('height', parseFloat(e.target.value))} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Age</label>
                        <Input 
                            type="number"
                            value={formData.age} 
                            onChange={(e) => handleChange('age', parseFloat(e.target.value))} 
                        />
                    </div>
                </div>
                
                <div className="bg-brand-blue/10 border border-brand-blue text-brand-blue rounded-md p-4 flex items-center justify-between">
                    <span className="font-bold uppercase text-sm tracking-wide">Body Mass Index</span>
                    <span className="font-black text-xl">{bmi || '--'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Gender</label>
                        <Select 
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Not specified">Prefer not to say</option>
                        </Select>
                     </div>
                </div>
            </Card>
        </section>

        {/* Goals */}
        <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target size={14} /> Targets
            </h3>
            <Card className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Activity</label>
                        <Select 
                            value={formData.activityLevel}
                            onChange={(e) => handleChange('activityLevel', e.target.value)}
                        >
                            <option value="Sedentary">Sedentary</option>
                            <option value="Light">Light Active</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Very Active">Very Active</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Goal</label>
                        <Select 
                            value={formData.fitnessGoal}
                            onChange={(e) => handleChange('fitnessGoal', e.target.value)}
                        >
                            <option value="Lose Weight">Lose Weight</option>
                            <option value="Maintain">Maintain</option>
                            <option value="Gain Muscle">Gain Muscle</option>
                        </Select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wide">Calculated Daily Goals</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Calories</label>
                            <Input 
                                type="number"
                                value={formData.dailyCalorieGoal} 
                                disabled
                                className="bg-slate-50 text-slate-500 border-transparent font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Protein (g)</label>
                                <Input 
                                    type="number"
                                    value={formData.proteinGoal} 
                                    disabled
                                    className="bg-slate-50 text-slate-500 border-transparent font-medium"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Carbs (g)</label>
                                <Input 
                                    type="number"
                                    value={formData.carbsGoal} 
                                    disabled
                                    className="bg-slate-50 text-slate-500 border-transparent font-medium"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wide mb-1">Fat (g)</label>
                                <Input 
                                    type="number"
                                    value={formData.fatGoal} 
                                    disabled
                                    className="bg-slate-50 text-slate-500 border-transparent font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </section>

        {/* Integrations */}
        <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Link size={14} /> Integrations
            </h3>
            <Card className="grid gap-4">
                <p className="text-sm text-slate-500">
                    Automatically sync your daily steps and workouts.
                </p>
                <div className="space-y-3">
                    {INTEGRATION_SERVICES.map(service => {
                        const isConnected = formData.connectedServices.includes(service.id);
                        const Icon = service.icon;

                        const toggleConnection = () => {
                            const currentServices = formData.connectedServices;
                            if (isConnected) {
                                handleChange('connectedServices', currentServices.filter(s => s !== service.id));
                            } else {
                                handleChange('connectedServices', [...currentServices, service.id]);
                            }
                        };

                        return (
                            <div key={service.id} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-gray rounded-md">
                                <div className="flex items-center gap-4">
                                    <Icon size={24} className={isConnected ? 'text-brand-blue' : 'text-slate-400'} />
                                    <div>
                                        <h4 className="font-bold text-brand-dark">{service.name}</h4>
                                        {service.description && <p className="text-xs text-slate-500">{service.description}</p>}
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={toggleConnection} 
                                    className={isConnected ? 'bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 border border-transparent' : 'bg-brand-blue hover:bg-sky-600'}
                                >
                                    {isConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </section>

        <Button onClick={handleSave} className="w-full bg-brand-red text-white hover:bg-red-700 py-4 text-lg">Confirm Updates</Button>
      </div>
    </div>
  );
};