import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  User,
  CalendarDays,
  Watch,
  HeartPulse,
  Smartphone
} from 'lucide-react';
import { UserProfile } from './types';

export const APP_NAME = "CalorieProfile";

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
  { id: 'history', label: 'History', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: User },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Guest User',
  email: 'guest@example.com',
  weight: 0,
  height: 0,
  age: 0,
  gender: 'Not specified',
  activityLevel: 'Moderate',
  fitnessGoal: 'Maintain',
  dailyCalorieGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 200,
  fatGoal: 67,
  onboardingComplete: false,
  connectedServices: [],
};

export const INTEGRATION_SERVICES = [
  { id: 'garmin', name: 'Garmin', icon: Watch },
  { id: 'polar', name: 'Polar', icon: HeartPulse },
  { id: 'apple_health', name: 'Apple Health', icon: Smartphone, description: 'Syncs Apple Watch data' },
];

// Helper to get today's date string YYYY-MM-DD
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper: Calculate BMR and Goals (Mifflin-St Jeor Equation)
export const calculateNutritionalGoals = (
  weight: number, 
  height: number, 
  age: number, 
  gender: string, 
  activityLevel: string,
  goal: string
) => {
  // 1. BMR Calculation
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  
  if (gender === 'Male') bmr += 5;
  else if (gender === 'Female') bmr -= 161;
  else bmr -= 78; // Average of +5 and -161 for non-specified

  // 2. TDEE (Total Daily Energy Expenditure) Multipliers
  const activityMultipliers: {[key: string]: number} = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Very Active': 1.725
  };
  
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // 3. Goal Adjustment
  let targetCalories = tdee;
  if (goal === 'Lose Weight') targetCalories -= 500; // ~0.5kg per week
  else if (goal === 'Gain Muscle') targetCalories += 300; // Moderate surplus

  // Ensure generic safety bounds (1200 min)
  targetCalories = Math.max(1200, Math.round(targetCalories));

  // 4. Macronutrients (40% C, 30% P, 30% F)
  const proteinGoal = Math.round((targetCalories * 0.30) / 4);
  const carbsGoal = Math.round((targetCalories * 0.40) / 4);
  const fatGoal = Math.round((targetCalories * 0.30) / 9);

  return {
    dailyCalorieGoal: targetCalories,
    proteinGoal,
    carbsGoal,
    fatGoal
  };
};