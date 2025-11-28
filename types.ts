export enum LogType {
  FOOD = 'FOOD',
  EXERCISE = 'EXERCISE'
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  SNACK = 'Snack'
}

export interface LogEntry {
  id: string;
  type: LogType;
  name: string;
  calories: number;
  timestamp: number; // Unix timestamp
  mealType?: MealType; // Optional, mainly for food
  details?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    durationMinutes?: number;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onboardingComplete: boolean;
  connectedServices: string[]; // e.g. ['garmin', 'polar']
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface ExerciseAnalysisResult {
  activityName: string;
  caloriesBurned: number;
  durationMinutes: number;
}

export interface DaySummary {
  dateStr: string; // YYYY-MM-DD
  totalIn: number;
  totalOut: number;
  net: number;
}