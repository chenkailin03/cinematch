# CineMatch — AI Movie Recommendation Assistant

CineMatch is a conversational AI web application that helps users discover movies through guided dialogue. Instead of keyword search, the AI guides users step by step to build rich preference tags, then recommends ranked results with explanations and a viewing plan.

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c923800c-ba61-4944-b0bc-1fec2e112c74

## 🚀 How to Run

### Prerequisites
- Node.js (v18 or above) — download from https://nodejs.org
- A Gemini API Key — get one free at https://aistudio.google.com (click "Get API Key")

### Steps

1. Clone this repository:
```bash
   git clone https://github.com/你的用户名/cinematch.git
   cd cinematch
```

2. Install dependencies:
```bash
   npm install
```

3. Set up your API key:
   - Create a new file called `.env` in the root directory
   - Add the following line:
```
   VITE_GEMINI_API_KEY=your_api_key_here
```
   - Replace `your_api_key_here` with your actual Gemini API key

4. Start the development server:
```bash
   npm run dev
```

5. Open your browser and go to:
```
   http://localhost:3000
```

The app should now be running locally. If you see a blank page or errors, make sure your API key is correctly set in the `.env` file.

## 🤖 AI Model Used

- **Model**: Gemini 2.0 Flash Preview (`gemini-2.0-flash-preview`)
- **Provider**: Google AI Studio
- **Full system prompt**: See `src/services/geminiService.ts`

## 📦 Open-Source Code

No external open-source projects were imported as a base.

**Third-party libraries used** (via npm):
- `react` / `react-dom` (v19.0.0) — UI framework
- `typescript` (v5.8.2) — Type safety
- `tailwindcss` (v4.1.14) — Styling
- `vite` (v6.2.0) — Build tool
- `@google/generative-ai` (v1.29.0) — Gemini API SDK
- `html-to-image` (v1.11.13) — Export recommendations as a downloadable image
- `lucide-react` (v0.546.0) — Icon library (sun/moon toggle, send button, etc.)
- `motion` (v12.23.24) — Smooth animation transitions
- `clsx` / `tailwind-merge` — Utility for conditional CSS class management
- `express` (v4.21.2) — Local development server

## 🛠️ Initial Code Generation

The initial project scaffold was generated using **Google AI Studio's vibe coding feature**. The generated code provided a basic React + Vite structure with a simple chat interface connected to the Gemini API.

## ✏️ Changes & New Features Implemented

The following changes were made beyond the AI-generated initial code:

**Tag System Redesign**
- Replaced the original fixed 4-category tag system (Style, Country, Character Types, Theme) with a fully dynamic tag system
- AI now freely extracts and generates tag categories based on the specific movie or user input
- Cast & crew tags are displayed in a visually distinct separate section
- Users can remove individual tags and manually add custom tags

**UI & Visual Design**
- Completely redesigned the color scheme to a premium cinematic dark theme (deep blue-black with purple-blue gradient accents and rose pink highlights)
- Added a light/dark mode toggle with smooth 300ms transition animations
- Redesigned recommendation output as structured cards showing similarity level, matching points, and differences

**Bilingual Support**
- Implemented full English/Chinese (中文) language toggle in the top-right corner
- All UI labels, AI responses, and interface text switch dynamically based on user selection
- Translation strings managed in a dedicated `translations.ts` file

**User Onboarding**
- Added clickable example prompt chips below the opening AI message
- Examples include: "Find me movies similar to Parasite", "I want a slow-burn psychological thriller set in Europe", etc.
- Chips disappear after the user sends their first message

**AI Behavior & Prompt Engineering**
- Iteratively refined the system prompt to improve tag extraction quality and recommendation depth
- Added similarity scoring (High / Medium-High / Medium) to each recommendation
- Added structured viewing plan generation after recommendations
- AI asks clarifying questions when user input is vague, reducing errors

**Export Feature**
- Implemented image export using `html-to-image`
- Users can download the full results (recommendations + comparisons + viewing plan) as a single image file

## 👤 Pilot User Study Insights

Three key insights from user testing that directly shaped design decisions:
1. Users wanted more tag variety → expanded from fixed categories to dynamic AI-generated categories
2. The opening question felt too abstract → added clickable example prompts to reduce friction
3. Dark-only mode felt heavy → added light/dark mode toggle based on feedback
