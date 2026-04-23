/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Trash2, 
  X, 
  Film, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Info,
  Plus,
  Languages,
  Sun,
  Moon
} from "lucide-react";
import { toPng } from "html-to-image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { 
  Message, 
  TagCategory, 
  MovieRecommendation, 
  ViewingStep,
  AppState,
  SimilarityLevel,
  Language,
  Theme
} from "./types";
import { 
  generateTags, 
  generateRecommendations, 
  generateViewingPlan 
} from "./services/geminiService";
import { translations } from "./translations";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EXAMPLE_PROMPTS = [
  "Find me movies similar to Parasite",
  "I want a slow-burn psychological thriller set in Europe",
  "Something with a strong female lead and a revenge plot",
  "Movies like Interstellar but more emotional"
];

export default function App() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<AppState>(() => {
    const savedLang = typeof window !== 'undefined' ? sessionStorage.getItem('cinematch_lang') as Language : null;
    const savedTheme = typeof window !== 'undefined' ? sessionStorage.getItem('cinematch_theme') as Theme : null;
    const lang = savedLang || 'en';
    const theme = savedTheme || 'dark';
    const t = translations[lang];
    
    return {
      messages: [
        {
          sender: "ai",
          content: t.initialMsg,
          type: "text"
        }
      ],
      tags: [],
      recommendations: [],
      viewingPlan: [],
      status: "idle",
      customTagInput: "",
      language: lang,
      theme: theme
    };
  });

  const t = translations[state.language];

  useEffect(() => {
    sessionStorage.setItem('cinematch_lang', state.language);
  }, [state.language]);

  useEffect(() => {
    sessionStorage.setItem('cinematch_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const toggleLanguage = () => {
    const nextLang: Language = state.language === 'en' ? 'zh' : 'en';
    const nt = translations[nextLang];
    
    setState(prev => {
      // If we're at the very start, also translate the first message
      const messages = [...prev.messages];
      if (messages.length === 1 && prev.status === 'idle') {
        messages[0] = { ...messages[0], content: nt.initialMsg };
      }
      
      return {
        ...prev,
        language: nextLang,
        messages
      };
    });
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const addMessage = (msg: Message) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
  };

  const processInput = async (msgText: string) => {
    if (!msgText.trim() || state.status === "generating_tags" || state.status === "generating_recommendations") return;

    addMessage({ sender: "user", content: msgText, type: "text" });

    if (state.status === "idle") {
      setState(prev => ({ ...prev, status: "generating_tags" }));
      const tags = await generateTags(msgText, state.language);
      setState(prev => ({ 
        ...prev, 
        tags, 
        status: "waiting_tag_confirm" 
      }));
      addMessage({ 
        sender: "ai", 
        content: translations[state.language].tagExtractionMsg,
        type: "tags"
      });
    }
  };

  const handleSend = () => {
    const userMsg = input;
    setInput("");
    processInput(userMsg);
  };

  const removeTag = (categoryIdx: number, tagIdx: number) => {
    setState(prev => {
      const newTags = prev.tags.map((cat, cIdx) => {
        if (cIdx === categoryIdx) {
          return {
            ...cat,
            tags: cat.tags.filter((_, tIdx) => tIdx !== tagIdx)
          };
        }
        return cat;
      }).filter(cat => cat.tags.length > 0);
      
      return { ...prev, tags: newTags };
    });
  };

  const addCustomTag = () => {
    if (!state.customTagInput.trim()) return;
    
    setState(prev => {
      const newTags = [...prev.tags];
      const categoryLabel = state.language === 'en' ? "My Additions" : "我的补充";
      const customCatIdx = newTags.findIndex(c => c.category === categoryLabel);
      
      if (customCatIdx !== -1) {
        newTags[customCatIdx].tags = [...newTags[customCatIdx].tags, prev.customTagInput.trim()];
      } else {
        newTags.push({
          category: categoryLabel,
          tags: [prev.customTagInput.trim()]
        });
      }
      
      return { ...prev, tags: newTags, customTagInput: "" };
    });
  };

  const confirmTags = async () => {
    setState(prev => ({ ...prev, status: "generating_recommendations" }));
    
    const recommendations = await generateRecommendations(state.tags, state.language);
    const plan = await generateViewingPlan(recommendations, state.language);
    
    setState(prev => ({ 
      ...prev, 
      recommendations, 
      viewingPlan: plan, 
      status: "completed" 
    }));
    
    addMessage({
      sender: "ai",
      content: translations[state.language].resultsReadyMsg,
      type: "plan"
    });
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        backgroundColor: state.theme === 'dark' ? "#0D0F1A" : "#F8F9FF" 
      });
      const link = document.createElement("a");
      link.download = `cinematch-recommendations-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <header className="mb-8 relative text-center">
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-panel-border text-text-dim hover:text-white hover:border-brand-purple/50 transition-all shadow-sm flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {state.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-panel-border text-[10px] font-bold text-text-dim hover:text-white hover:border-brand-purple/50 transition-all shadow-sm"
          >
            <Languages size={14} />
            {state.language === 'en' ? "EN / 中文" : "中文 / EN"}
          </button>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-text-main tracking-tighter"
        >
          <span className="text-gradient">CineMatch</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium uppercase tracking-widest text-text-dim mt-1"
        >
          {t.tagline}
        </motion.p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {state.messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.sender === "ai" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col max-w-[85%] mb-4",
                msg.sender === "ai" ? "self-start" : "self-end items-end"
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-dim mb-1 px-1">
                {msg.sender === "ai" ? t.aiLabel : t.userLabel}
              </span>
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.sender === "ai" 
                    ? "bg-chat-ai border border-panel-border panel-glow text-text-main/90 rounded-tl-none" 
                    : "btn-premium text-white font-medium rounded-tr-none shadow-lg shadow-brand-purple/20"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Initial Example Prompts */}
        {state.messages.length === 1 && state.status === "idle" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 px-1"
          >
            {t.prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => processInput(prompt)}
                className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-brand-purple/10 hover:border-brand-purple/50 transition-all shadow-sm text-text-dim hover:text-white font-medium text-left"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}

        {/* Dynamic AI Content (Tags, Recs, Plan) */}
        {state.tags.length > 0 && state.status === "waiting_tag_confirm" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="panel-glass panel-glow p-6 rounded-3xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-text-main font-bold text-lg flex items-center gap-2">
                  <Sparkles className="text-brand-rose" size={18} /> {t.panelTitle}
                </h3>
                <div className="flex gap-2 w-full md:w-auto">
                  <input 
                    type="text"
                    value={state.customTagInput}
                    onChange={(e) => setState(prev => ({ ...prev, customTagInput: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                    placeholder={t.addTagPlaceholder}
                    className="text-xs bg-white/5 border border-panel-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-purple/50 flex-1 md:w-48 text-text-main"
                  />
                  <button 
                    onClick={addCustomTag}
                    className="bg-brand-purple text-white p-1.5 rounded-lg hover:bg-brand-purple/90 shrink-0 shadow-lg shadow-brand-purple/20 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {state.tags.map((category, cIdx) => (
                  <div 
                    key={category.category} 
                    className={cn(
                      "p-4 rounded-2xl border transition-colors",
                      category.isPeople 
                        ? "bg-brand-rose/5 border-brand-rose/20" 
                        : "bg-brand-purple/5 border-brand-purple/10"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md",
                        category.isPeople ? "bg-brand-rose text-white" : "bg-brand-purple text-white shadow-sm shadow-brand-purple/20"
                      )}>
                        {category.category}
                      </span>
                      {category.isPeople && <span className="text-[10px] text-brand-rose font-bold italic">{t.castCrew}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag, tIdx) => (
                        <div 
                          key={tIdx} 
                          className="chip-premium"
                        >
                          <span className="text-[13px] font-medium text-text-main/90 leading-none">{tag}</span>
                          <button 
                            onClick={() => removeTag(cIdx, tIdx)}
                            className="text-text-main/20 hover:text-brand-rose p-0.5 rounded-md transition-all flex items-center justify-center shrink-0"
                            aria-label={`Remove ${tag}`}
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={confirmTags}
                disabled={state.status !== "waiting_tag_confirm"}
                className="w-full mt-8 btn-premium py-4 px-6"
              >
                <CheckCircle2 size={18} /> {t.confirmTagsBtn}
              </button>
            </div>
          </motion.div>
        )}

        {state.recommendations.length > 0 && (
          <div ref={exportRef} className="space-y-8 pb-4 p-4 rounded-3xl bg-bg-deep border border-brand-purple/10">
            {/* Result Header */}
            <div className="mb-4 text-center border-b border-panel-border pb-6">
              <h2 className="text-gradient font-extrabold text-2xl tracking-tighter">CineMatch</h2>
              <p className="text-text-dim text-[10px] uppercase tracking-widest">{t.curatedJourney}</p>
            </div>

            {/* Recommendations Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              <h3 className="text-xl font-bold flex items-center gap-2 px-1 text-text-main">
                <Film className="text-brand-purple" size={20} /> {t.recsTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.recommendations.map((rec, i) => (
                  <div key={i} className="panel-glass p-5 rounded-2xl flex flex-col h-full hover:border-brand-purple/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg leading-tight text-text-main">{rec.title}</h4>
                        <span className="text-xs text-text-dim">{rec.year}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] uppercase font-black px-2 py-1 rounded border",
                        rec.similarity === "High" ? "border-brand-rose text-brand-rose shadow-[0_0_10px_rgba(244,114,182,0.2)]" : "border-panel-border text-text-main/30"
                      )}>
                        {rec.similarity === 'High' ? (state.language === 'en' ? 'High' : '极高') : (rec.similarity)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-brand-purple tracking-tighter flex items-center gap-1">
                          <TrendingUp size={10} /> {t.matchingPoints}
                        </span>
                        <ul className="text-[11px] text-text-main/70 space-y-1">
                          {rec.matchingPoints.slice(0, 3).map((p, j) => (
                            <li key={j} className="flex items-start gap-1">
                              <span className="text-brand-purple">•</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-text-dim tracking-tighter flex items-center gap-1">
                          <Info size={10} /> {t.differences}
                        </span>
                        <ul className="text-[11px] text-text-main/40 space-y-1">
                          {rec.differences.slice(0, 3).map((d, j) => (
                            <li key={j} className="flex items-start gap-1">
                              <span className="text-text-main/10">•</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Viewing Plan Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold flex items-center gap-2 px-1 text-text-main">
                <Sparkles className="text-brand-rose" size={20} /> {t.journeyTitle}
              </h3>
              <div className="panel-glass p-6 rounded-3xl">
                <div className="space-y-4">
                  {state.viewingPlan.map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(108,99,255,0.1)]">
                          {i + 1}
                        </div>
                        {i !== state.viewingPlan.length - 1 && (
                          <div className="w-px flex-1 bg-panel-border my-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <h5 className="font-bold text-text-main/90 group-hover:text-brand-purple transition-colors">{step.title}</h5>
                        <p className="text-xs text-text-dim mt-1 leading-relaxed italic">{step.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}


        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <footer className="space-y-4">
        {state.status === "completed" && (
          <button
            onClick={handleExport}
            className="w-full bg-bg-card hover:bg-bg-card/80 text-text-main border border-panel-border font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download size={18} /> {t.exportButton}
          </button>
        )}

        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={state.status === "generating_tags" || state.status === "generating_recommendations"}
            placeholder={
              state.status === "generating_tags" || state.status === "generating_recommendations"
                ? t.thinking
                : t.inputPlaceholder
            }
            className="w-full bg-bg-card border border-panel-border rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-brand-purple/40 transition-all placeholder:text-text-dim/30 disabled:opacity-50 text-text-main shadow-2xl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.status === "generating_tags" || state.status === "generating_recommendations"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl btn-premium shadow-md shadow-brand-purple/20"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}


