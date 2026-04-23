export type SimilarityLevel = 'High' | 'Medium-High' | 'Medium';

export interface TagCategory {
  category: string;
  tags: string[];
  isPeople?: boolean;
}

export interface MovieRecommendation {
  title: string;
  year: string;
  similarity: SimilarityLevel;
  matchingPoints: string[];
  differences: string[];
}

export interface ViewingStep {
  title: string;
  reason: string;
}

export interface Message {
  sender: 'ai' | 'user';
  content: string;
  type?: 'text' | 'tags' | 'recommendations' | 'plan';
}

export type Language = 'en' | 'zh';
export type Theme = 'dark' | 'light';

export interface AppState {
  messages: Message[];
  tags: TagCategory[];
  recommendations: MovieRecommendation[];
  viewingPlan: ViewingStep[];
  status: 'idle' | 'generating_tags' | 'waiting_tag_confirm' | 'generating_recommendations' | 'completed';
  customTagInput: string;
  language: Language;
  theme: Theme;
}
