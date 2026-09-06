import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { 
  AppContextType, 
  Settings, 
  Progress, 
  WrongQuestion, 
  ChallengeProgress,
  LevelProgress,
  PinyinFavorite,
  Gamification,
  LevelUpInfo,
  QuestType,
} from '../types'
import { 
  loadAppData, 
  saveAppData, 
  checkAndUpdateStreak,
  getTodayDateString 
} from '../utils/storage'
import { 
  addXpPure, 
  comboXpBonus, 
  comboCoinBonus, 
  starsToCoins, 
  createDailyQuests, 
} from '../utils/gamification'
import { getPackById } from '../data/stickers'

const AppContext = createContext<AppContextType | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => loadAppData().settings)
  const [progress, setProgress] = useState<Progress>(() => {
    const data = loadAppData().progress
    return {
      ...data,
      englishProgress: data.englishProgress || { totalQuestions: 0, correctAnswers: 0, learnedWords: [] },
      charactersProgress: data.charactersProgress || { totalQuestions: 0, correctAnswers: 0, learnedChars: [] },
      poemsLearned: data.poemsLearned || [],
    }
  })
  const [wrongBook, setWrongBook] = useState<WrongQuestion[]>(() => loadAppData().wrongBook)
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(
    () => loadAppData().challengeProgress
  )
  const [pinyinFavorites, setPinyinFavorites] = useState<PinyinFavorite[]>(
    () => loadAppData().pinyinFavorites || []
  )
  const [gamification, setGamification] = useState<Gamification>(
    () => loadAppData().gamification
  )
  const [levelUp, setLevelUp] = useState<LevelUpInfo | null>(null)

  useEffect(() => {
    const data = checkAndUpdateStreak(loadAppData())
    setProgress(prev => ({
      ...data.progress,
      englishProgress: prev.englishProgress || { totalQuestions: 0, correctAnswers: 0, learnedWords: [] },
      charactersProgress: prev.charactersProgress || { totalQuestions: 0, correctAnswers: 0, learnedChars: [] },
      poemsLearned: data.progress.poemsLearned || [],
    }))
    // 每日任务跨天自动重置
    const today = getTodayDateString()
    const gam = data.gamification.dailyQuests.date === today
      ? data.gamification
      : { ...data.gamification, dailyQuests: createDailyQuests(today) }
    setGamification(gam)
    saveAppData({ ...data, gamification: gam })
  }, [])

  useEffect(() => {
    saveAppData({ settings, progress, wrongBook, challengeProgress, pinyinFavorites, gamification })
  }, [settings, progress, wrongBook, challengeProgress, pinyinFavorites, gamification])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const updateProgress = useCallback((newProgress: Partial<Progress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }))
  }, [])

  const addWrongQuestion = useCallback((question: WrongQuestion) => {
    setWrongBook(prev => {
      const existingIndex = prev.findIndex(q => q.id === question.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...question,
          retryCount: prev[existingIndex].retryCount + 1,
        }
        return updated
      }
      return [...prev, question]
    })
  }, [])

  const removeWrongQuestion = useCallback((id: string) => {
    setWrongBook(prev => prev.filter(q => q.id !== id))
  }, [])

  const clearWrongBook = useCallback(() => {
    setWrongBook([])
  }, [])

  const updateChallengeProgress = useCallback((levelId: string, levelProgress: Partial<LevelProgress>) => {
    setChallengeProgress(prev => {
      const existing = prev[levelId] || { stars: 0, completed: false, attempts: 0 }
      return {
        ...prev,
        [levelId]: {
          ...existing,
          ...levelProgress,
        },
      }
    })
  }, [])

  // ---------- 游戏化核心 ----------

  const dismissLevelUp = useCallback(() => setLevelUp(null), [])

  // 加经验（内部），处理升级弹窗
  const applyXp = useCallback((amount: number) => {
    setGamification(prev => {
      const res = addXpPure(prev.growth, amount)
      if (res.levelsGained > 0) {
        setLevelUp({
          fromLevel: prev.growth.level,
          toLevel: res.growth.level,
          title: res.newTitle,
        })
      }
      return { ...prev, growth: res.growth }
    })
  }, [])

  const addCoins = useCallback((amount: number) => {
    setGamification(prev => ({ ...prev, coins: prev.coins + Math.max(0, amount) }))
  }, [])

  // 推进某个每日任务进度（completed 后封顶）
  const addQuestProgress = useCallback((type: QuestType, amount: number) => {
    if (amount <= 0) return
    setGamification(prev => {
      const quests = prev.dailyQuests.quests.map(q => {
        if (q.type !== type || q.completed || q.claimed) return q
        const progress = Math.min(q.target, q.progress + amount)
        return { ...q, progress, completed: progress >= q.target }
      })
      return { ...prev, dailyQuests: { ...prev.dailyQuests, quests } }
    })
  }, [])

  // 每次作答（答对）触发：经验 + 金币 + 最高连击 + 任务进度
  const onAnswerGamification = useCallback((isCorrect: boolean, combo: number) => {
    if (!isCorrect) return
    applyXp(10 + comboXpBonus(combo))
    addCoins(1 + comboCoinBonus(combo))
    setGamification(prev => ({
      ...prev,
      growth: { ...prev.growth, maxCombo: Math.max(prev.growth.maxCombo, combo) },
    }))
    addQuestProgress('doQuestions', 1)
    addQuestProgress('combo5', combo >= 5 ? 1 : 0)
  }, [applyXp, addCoins, addQuestProgress])

  // 学会一首古诗：记录 + 首次奖励（+20 经验 +3 金币）
  const markPoemLearned = useCallback((poemId: string): boolean => {
    if (progress.poemsLearned.includes(poemId)) return false
    setProgress(prev => ({
      ...prev,
      poemsLearned: prev.poemsLearned.includes(poemId) ? prev.poemsLearned : [...prev.poemsLearned, poemId],
    }))
    applyXp(20)
    addCoins(3)
    addQuestProgress('doQuestions', 1)
    return true
  }, [progress.poemsLearned, applyXp, addCoins, addQuestProgress])

  // 一次练习结束（≥10题且正确率≥80% 完成"准星"任务）
  const completePractice = useCallback((totalQuestions: number, correctAnswers: number) => {
    if (totalQuestions >= 10 && correctAnswers / totalQuestions >= 0.8) {
      addQuestProgress('accuracy80', 1)
    }
  }, [addQuestProgress])

  // 闯关通关：星级金币 + 50 经验 + 任务
  const completeLevel = useCallback((stars: number) => {
    addCoins(starsToCoins(stars))
    applyXp(50)
    addQuestProgress('clearLevel', 1)
  }, [addCoins, applyXp, addQuestProgress])

  // 限时挑战结束：记录最好成绩 + 任务进度（经验/金币已在每次答对时发放）
  const completeTimeAttack = useCallback((mode: string, score: number) => {
    const isNewRecord = score > (gamification.timeAttackBest[mode] || 0)
    setGamification(prev => ({
      ...prev,
      timeAttackBest: {
        ...prev.timeAttackBest,
        [mode]: Math.max(prev.timeAttackBest[mode] || 0, score),
      },
    }))
    addQuestProgress('timeAttack', 1)
    return isNewRecord
  }, [gamification.timeAttackBest, addQuestProgress])

  // 领取单个任务奖励
  const claimQuest = useCallback((questId: string) => {
    setGamification(prev => {
      const quest = prev.dailyQuests.quests.find(q => q.id === questId)
      if (!quest || !quest.completed || quest.claimed) return prev
      const quests = prev.dailyQuests.quests.map(q => q.id === questId ? { ...q, claimed: true } : q)
      const allDone = quests.every(q => q.claimed)
      const res = addXpPure(prev.growth, quest.rewardXp)
      if (res.levelsGained > 0) {
        setLevelUp({ fromLevel: prev.growth.level, toLevel: res.growth.level, title: res.newTitle })
      }
      return {
        ...prev,
        coins: prev.coins + quest.rewardCoins,
        growth: res.growth,
        dailyQuests: { ...prev.dailyQuests, quests, allClaimed: allDone && prev.dailyQuests.allClaimed },
      }
    })
  }, [])

  // 一键领取全部：先领各任务奖励，再额外发放全完成大奖 +20 金币 / +50 经验
  const claimAllQuests = useCallback(() => {
    setGamification(prev => {
      if (prev.dailyQuests.allClaimed) return prev
      const allDone = prev.dailyQuests.quests.every(q => q.completed)
      if (!allDone) return prev
      const quests = prev.dailyQuests.quests.map(q => q.claimed ? q : { ...q, claimed: true })
      const unclaimed = prev.dailyQuests.quests.filter(q => !q.claimed)
      const coinsFromQuests = unclaimed.reduce((s, q) => s + q.rewardCoins, 0)
      const xpFromQuests = unclaimed.reduce((s, q) => s + q.rewardXp, 0)
      const res = addXpPure(prev.growth, 50 + xpFromQuests)
      if (res.levelsGained > 0) {
        setLevelUp({ fromLevel: prev.growth.level, toLevel: res.growth.level, title: res.newTitle })
      }
      return {
        ...prev,
        coins: prev.coins + 20 + coinsFromQuests,
        growth: res.growth,
        dailyQuests: { ...prev.dailyQuests, quests, allClaimed: true },
      }
    })
  }, [])

  // 购买贴纸：30 金币兑换 1 张（不重复），集齐一套 +50
  const buyStickerPack = useCallback((packId: string): { newStickers: string[]; refund: number } | null => {
    const pack = getPackById(packId)
    if (!pack) return null
    const owned = gamification.shop.ownedStickers[packId] || []
    if (owned.length >= pack.stickers.length) return { newStickers: [], refund: 0 }
    if (gamification.coins < 30) return null
    const available = pack.stickers.filter(s => !owned.includes(s.id))
    const picked = [...available].sort(() => Math.random() - 0.5).slice(0, 1).map(s => s.id)
    const refund = (1 - picked.length) * 15
    setGamification(prev => {
      const curOwned = prev.shop.ownedStickers[packId] || []
      const newOwned = [...new Set([...curOwned, ...picked])]
      const completeBonus = newOwned.length >= pack.stickers.length ? 50 : 0
      return {
        ...prev,
        coins: prev.coins - 30 + refund + completeBonus,
        shop: { ...prev.shop, ownedStickers: { ...prev.shop.ownedStickers, [packId]: newOwned } },
      }
    })
    return { newStickers: picked, refund }
  }, [gamification.coins, gamification.shop.ownedStickers])

  // 购买皮肤：80 金币，购买后立即生效
  const buySkin = useCallback((skinId: string): boolean => {
    if (skinId === '') return true
    if (gamification.shop.ownedSkins.includes(skinId)) return true
    if (gamification.coins < 80) return false
    setGamification(prev => ({
      ...prev,
      coins: prev.coins - 80,
      shop: {
        ...prev.shop,
        ownedSkins: [...prev.shop.ownedSkins, skinId],
        activeSkin: skinId,
      },
    }))
    return true
  }, [gamification.coins, gamification.shop.ownedSkins])

  const setActiveSkin = useCallback((skinId: string) => {
    setGamification(prev => ({ ...prev, shop: { ...prev.shop, activeSkin: skinId } }))
  }, [])

  const resetAllData = useCallback(() => {
    const defaultSettings: Settings = {
      fontSize: 'medium',
      soundEnabled: true,
      theme: 'cartoon',
      pinyinSpeed: 'normal',
      showSpellingHint: true,
    }
    const defaultProgress: Progress = {
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      lastActiveDate: getTodayDateString(),
      todayQuestions: 0,
      todayCorrect: 0,
      mathProgress: { totalQuestions: 0, correctAnswers: 0 },
      pinyinProgress: { totalQuestions: 0, correctAnswers: 0, learnedPinyin: [] },
      englishProgress: { totalQuestions: 0, correctAnswers: 0, learnedWords: [] },
      charactersProgress: { totalQuestions: 0, correctAnswers: 0, learnedChars: [] },
      poemsLearned: [],
    }
    const defaultGamification: Gamification = {
      growth: { xp: 0, level: 1, maxCombo: 0 },
      coins: 0,
      timeAttackBest: {},
      dailyQuests: createDailyQuests(getTodayDateString()),
      shop: { ownedStickers: {}, ownedSkins: [], activeSkin: '' },
    }
    setSettings(defaultSettings)
    setProgress(defaultProgress)
    setWrongBook([])
    setChallengeProgress({})
    setPinyinFavorites([])
    setGamification(defaultGamification)
    setLevelUp(null)
  }, [])

  const recordAnswer = useCallback((isCorrect: boolean, module: 'math' | 'pinyin' = 'math') => {
    setProgress(prev => {
      const moduleProgress = module === 'math' ? prev.mathProgress : prev.pinyinProgress
      
      return {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        todayQuestions: prev.todayQuestions + 1,
        todayCorrect: isCorrect ? prev.todayCorrect + 1 : prev.todayCorrect,
        lastActiveDate: getTodayDateString(),
        mathProgress: module === 'math' ? {
          totalQuestions: moduleProgress.totalQuestions + 1,
          correctAnswers: isCorrect ? moduleProgress.correctAnswers + 1 : moduleProgress.correctAnswers,
        } : prev.mathProgress,
        pinyinProgress: module === 'pinyin' ? {
          ...prev.pinyinProgress,
          totalQuestions: prev.pinyinProgress.totalQuestions + 1,
          correctAnswers: isCorrect ? prev.pinyinProgress.correctAnswers + 1 : prev.pinyinProgress.correctAnswers,
        } : prev.pinyinProgress,
      }
    })
  }, [])

  const addPinyinFavorite = useCallback((pinyin: string) => {
    setPinyinFavorites(prev => {
      if (prev.some(f => f.pinyin === pinyin)) return prev
      return [...prev, { pinyin, addedAt: Date.now() }]
    })
  }, [])

  const removePinyinFavorite = useCallback((pinyin: string) => {
    setPinyinFavorites(prev => prev.filter(f => f.pinyin !== pinyin))
  }, [])

  const markPinyinLearned = useCallback((pinyin: string) => {
    setProgress(prev => {
      if (prev.pinyinProgress.learnedPinyin.includes(pinyin)) return prev
      return {
        ...prev,
        pinyinProgress: {
          ...prev.pinyinProgress,
          learnedPinyin: [...prev.pinyinProgress.learnedPinyin, pinyin],
        },
      }
    })
  }, [])

  const updatePinyinProgress = useCallback((totalQuestions: number, correctAnswers: number) => {
    setProgress(prev => ({
      ...prev,
      totalQuestions: prev.totalQuestions + totalQuestions,
      correctAnswers: prev.correctAnswers + correctAnswers,
      todayQuestions: prev.todayQuestions + totalQuestions,
      todayCorrect: prev.todayCorrect + correctAnswers,
      lastActiveDate: getTodayDateString(),
      pinyinProgress: {
        ...prev.pinyinProgress,
        totalQuestions: prev.pinyinProgress.totalQuestions + totalQuestions,
        correctAnswers: prev.pinyinProgress.correctAnswers + correctAnswers,
      },
    }))
  }, [])

  const updateEnglishProgress = useCallback((totalQuestions: number, correctAnswers: number) => {
    setProgress(prev => ({
      ...prev,
      totalQuestions: prev.totalQuestions + totalQuestions,
      correctAnswers: prev.correctAnswers + correctAnswers,
      todayQuestions: prev.todayQuestions + totalQuestions,
      todayCorrect: prev.todayCorrect + correctAnswers,
      lastActiveDate: getTodayDateString(),
      englishProgress: {
        ...prev.englishProgress,
        totalQuestions: prev.englishProgress.totalQuestions + totalQuestions,
        correctAnswers: prev.englishProgress.correctAnswers + correctAnswers,
      },
    }))
  }, [])

  const updateCharacterProgress = useCallback((totalQuestions: number, correctAnswers: number) => {
    setProgress(prev => ({
      ...prev,
      totalQuestions: prev.totalQuestions + totalQuestions,
      correctAnswers: prev.correctAnswers + correctAnswers,
      todayQuestions: prev.todayQuestions + totalQuestions,
      todayCorrect: prev.todayCorrect + correctAnswers,
      lastActiveDate: getTodayDateString(),
      charactersProgress: {
        ...prev.charactersProgress,
        totalQuestions: prev.charactersProgress.totalQuestions + totalQuestions,
        correctAnswers: prev.charactersProgress.correctAnswers + correctAnswers,
      },
    }))
  }, [])

  const markCharacterLearned = useCallback((char: string) => {
    setProgress(prev => {
      if (prev.charactersProgress.learnedChars.includes(char)) return prev
      return {
        ...prev,
        charactersProgress: {
          ...prev.charactersProgress,
          learnedChars: [...prev.charactersProgress.learnedChars, char],
        },
      }
    })
  }, [])

  const value: AppContextType = {
    settings,
    progress,
    wrongBook,
    challengeProgress,
    pinyinFavorites,
    gamification,
    levelUp,
    dismissLevelUp,
    updateSettings,
    updateProgress,
    addWrongQuestion,
    removeWrongQuestion,
    clearWrongBook,
    updateChallengeProgress,
    resetAllData,
    recordAnswer,
    addPinyinFavorite,
    removePinyinFavorite,
    markPinyinLearned,
    updatePinyinProgress,
    updateEnglishProgress,
    updateCharacterProgress,
    markCharacterLearned,
    markPoemLearned,
    onAnswerGamification,
    completePractice,
    completeLevel,
    completeTimeAttack,
    claimQuest,
    claimAllQuests,
    buyStickerPack,
    buySkin,
    setActiveSkin,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
