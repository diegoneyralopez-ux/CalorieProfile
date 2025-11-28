import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, ExerciseAnalysisResult } from "../types";

// Initialize the client
// NOTE: We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Shared schema for food analysis
const FOOD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "A short, title-case name of the food" },
    calories: { type: Type.NUMBER, description: "Total estimated calories" },
    protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
    carbs: { type: Type.NUMBER, description: "Estimated carbs in grams" },
    fat: { type: Type.NUMBER, description: "Estimated fat in grams" },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
  },
  required: ["foodName", "calories", "protein", "carbs", "fat", "confidence"]
};

export const analyzeFoodText = async (text: string): Promise<FoodAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this food description and estimate nutritional values: "${text}". Be reasonable with portion sizes if not specified.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: FOOD_SCHEMA
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing food:", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Data: string): Promise<FoodAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: "Analyze this food image and estimate nutritional values. If multiple items are visible, sum them up. Return JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: FOOD_SCHEMA
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return null;
  }
};

export const analyzeExerciseText = async (text: string): Promise<ExerciseAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this exercise description and estimate calories burned: "${text}". Use average metabolic equivalents (METs) for calculation if needed.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activityName: { type: Type.STRING, description: "A short, title-case name of the activity" },
            caloriesBurned: { type: Type.NUMBER, description: "Total estimated calories burned" },
            durationMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes (default to 30 if not specified)" }
          },
          required: ["activityName", "caloriesBurned", "durationMinutes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText) as ExerciseAnalysisResult;
  } catch (error) {
    console.error("Error analyzing exercise:", error);
    return null;
  }
};

export const getMotivation = async (netCalories: number, goal: number): Promise<string> => {
  try {
    const diff = goal - netCalories;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Give a very short (max 15 words), encouraging, friendly remark for a user tracking calories.
      Context: Daily Goal: ${goal}, Net Calories so far: ${netCalories}.
      Difference: ${diff}.
      If they are under goal, encourage them to eat well. If over, be gentle.`,
    });
    return response.text || "Keep up the great work!";
  } catch (e) {
    return "Stay healthy and positive!";
  }
};

export const getDailyQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Give a short, inspirational fitness quote for the day. Make it punchy and motivating. Maximum 15 words.`,
    });
    return response.text?.trim() || "Every step is progress. Keep going!";
  } catch (e) {
    console.error("Error fetching daily quote:", e);
    return "Your only limit is you. Break it.";
  }
};