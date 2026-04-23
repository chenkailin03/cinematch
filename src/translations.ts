import { Language } from "./types";

export const translations = {
  en: {
    tagline: "AI Movie Recommender — Find your next favorite film",
    aiLabel: "CineMatch",
    userLabel: "You",
    prompts: [
      "Find me movies similar to Parasite",
      "I want a slow-burn psychological thriller set in Europe",
      "Something with a strong female lead and a revenge plot",
      "Movies like Interstellar but more emotional"
    ],
    panelTitle: "Preference Blueprint",
    addTagPlaceholder: "Add custom tag...",
    castCrew: "Cast & Crew",
    generateButton: "Generate My Personalized List",
    recsTitle: "Top Recommendations",
    journeyTitle: "Your Viewing Journey",
    matchingPoints: "Matches",
    differences: "Nuances",
    similarity: "Similarity",
    exportButton: "Export as Image",
    inputPlaceholder: "Type here to get started...",
    thinking: "CineMatch is thinking...",
    initialMsg: "Do you have a favorite movie you'd like to use as a reference, or do you already have some ideas about what kind of movie you want to watch?",
    tagExtractionMsg: "I've analyzed your request and extracted a rich set of tags. Please review them below — you can remove tags that don't fit or even add your own custom ones!",
    resultsReadyMsg: "Your results are ready! Click the Export button below to save your personalized recommendations and viewing journey.",
    confirmTagsBtn: "Generate My Personalized List",
    curatedJourney: "Your Curated Movie Journey"
  },
  zh: {
    tagline: "AI 电影推荐助手 — 寻找您的下一部心头好",
    aiLabel: "CineMatch",
    userLabel: "您",
    prompts: [
      "帮我找类似《寄生虫》的电影",
      "我想要一部在欧洲拍摄的慢节奏心理惊悚片",
      "想要一部有强力女性主角和复仇剧情的作品",
      "类似《星际穿越》但情感更丰富的电影"
    ],
    panelTitle: "偏好蓝图",
    addTagPlaceholder: "添加自定义标签...",
    castCrew: "演职人员",
    generateButton: "生成我的个性化清单",
    recsTitle: "为您推荐",
    journeyTitle: "您的观影计划",
    matchingPoints: "匹配点",
    differences: "细微差异",
    similarity: "匹配度",
    exportButton: "导出为图片",
    inputPlaceholder: "在此输入以开始...",
    thinking: "CineMatch 正在思考...",
    initialMsg: "您有特别喜欢的参考电影吗？或者您已经对想看的电影类型有了一些想法？",
    tagExtractionMsg: "我分析了您的需求并提取了一系列标签。请在下方核对——您可以移除不合适的标签，甚至添加您自己的自定义标签！",
    resultsReadyMsg: "您的推荐结果已就绪！点击下方的导出按钮，将您的个性化推荐和观影计划保存为图片。",
    confirmTagsBtn: "生成我的个性化清单",
    curatedJourney: "您的专属电影之旅"
  }
};

export type TranslationKey = keyof typeof translations.en;
