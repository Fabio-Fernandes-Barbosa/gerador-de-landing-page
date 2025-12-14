export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum Tab {
  GENERATOR = 'GENERATOR',
  PROMPT_REVIEW = 'PROMPT_REVIEW',
  PREVIEW = 'PREVIEW',
  ASSETS = 'ASSETS',
  VOICE = 'VOICE',
}

// Configuration for the Landing Page Inputs
export interface LandingPageConfig {
  niche: string;
  businessName: string;
  targetAudience: string;
  goal: string;
  offer: string;
  differentiators: string;
  cta: string;
}

// Old interface kept for backward compatibility if needed, but mainly we use raw HTML now
export interface LandingPageData {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  about: {
    title: string;
    content: string;
  };
  pricing: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
  footer: {
    text: string;
  };
}

export interface GeneratedAsset {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
