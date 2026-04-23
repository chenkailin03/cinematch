import { GoogleGenAI, Type } from "@google/genai";
import { TagCategory, MovieRecommendation, ViewingStep, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TAGS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Dynamic category name like 'Visual Style', 'Mood', 'Cast & Crew', etc." },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      isPeople: { type: Type.BOOLEAN, description: "True if the category contains names of actors, directors, or crew members." },
    },
    required: ["category", "tags"],
  },
};

const RECOMMENDATIONS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      year: { type: Type.STRING },
      similarity: { type: Type.STRING, enum: ["High", "Medium-High", "Medium"] },
      matchingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      differences: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["title", "year", "similarity", "matchingPoints", "differences"],
  },
};

const PLAN_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      reason: { type: Type.STRING },
    },
    required: ["title", "reason"],
  },
};

export async function generateTags(userInput: string, language: Language): Promise<TagCategory[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the user's movie preference or reference: "${userInput}".
    
    TASK: Extract all possible relevant keywords and group them into dynamic categories. 
    Be generous and thorough. Extract as many meaningful details as possible.
    
    IMPORTANT: Respond in ${language === 'zh' ? 'Chinese (简体中文)' : 'English'}.
    Category names and tag values (except movie titles/names) should be in ${language === 'zh' ? 'Chinese' : 'English'}.
    
    RULES for categories:
    1. Category names should be descriptive (e.g., 'Atmosphere & Mood', 'Plot Archetypes', 'Cinematography', 'Cast & Performance', 'Era & Setting').
    2. Group people (actors, directors, writers) into a category or multiple categories and set "isPeople: true" for them.
    3. Ensure tags are individual strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: TAGS_SCHEMA,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse tags", e);
    return [];
  }
}

export async function generateRecommendations(tags: TagCategory[], language: Language): Promise<MovieRecommendation[]> {
  const tagsStr = tags.map(c => `${c.category}: ${c.tags.join(", ")}`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these movie tags, recommend 5-8 movies ranked by similarity:
    ${tagsStr}
    
    IMPORTANT: Respond in ${language === 'zh' ? 'Chinese (简体中文)' : 'English'}.
    The fields "matchingPoints" and "differences" must be in ${language === 'zh' ? 'Chinese' : 'English'}.
    Keep movie titles and years as they are.
    
    Provide title, release year, similarity level (High, Medium-High, Medium), matching points, and differences.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECOMMENDATIONS_SCHEMA,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse recommendations", e);
    return [];
  }
}

export async function generateViewingPlan(recommendations: MovieRecommendation[], language: Language): Promise<ViewingStep[]> {
  const titles = recommendations.map(r => r.title).join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a viewing order plan for these movies: ${titles}.
    
    IMPORTANT: Respond in ${language === 'zh' ? 'Chinese (简体中文)' : 'English'}.
    The "reason" field must be in ${language === 'zh' ? 'Chinese' : 'English'}.
    
    Suggest which to watch first, second, etc., with a one-sentence reason for each position.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: PLAN_SCHEMA,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse viewing plan", e);
    return [];
  }
}
