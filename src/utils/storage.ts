import type { AppData, Settings, Progress, Gamification } from '../types'
import { createDailyQuests } from './gamification'

const STORAGE_KEY = 'joye_preschool_data'

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
  lastActiveDate: '',
  todayQuestions: 0,
  todayCorrect: 0,
  mathProgress: {
    totalQuestions: 0,
    correctAnswers: 0,
  },
  pinyinProgress: {
    totalQuestions: 0,
    correctAnswers: 0,
    learnedPinyin: [],
  },
  englishProgress: {
    totalQuestions: 0,
    correctAnswers: 0,
    learnedWords: [],
  },
  charactersProgress: {
    totalQuestions: 0,
    correctAnswers: 0,
    learnedChars: [],
  },
}

const defaultGamification: Gamification = {
  growth: { xp: 0, level: 1, maxCombo: 0 },
  coins: 0,
  timeAttackBest: {},
  dailyQuests: createDailyQuests(getTodayDateString()),
  shop: { ownedStickers: {}, ownedSkins: [], activeSkin: '' },
}

const defaultData: AppData = {
  settings: defaultSettings,
  progress: defaultProgress,
  wrongBook: [],
  challengeProgress: {},
  pinyinFavorites: [],
  gamification: defaultGamification,
}

export function loadAppData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as Partial<AppData>
      return {
        settings: { ...defaultSettings, ...data.settings },
        progress: { 
          ...defaultProgress, 
          ...data.progress,
          mathProgress: { ...defaultProgress.mathProgress, ...data.progress?.mathProgress },
          pinyinProgress: { ...defaultProgress.pinyinProgress, ...data.progress?.pinyinProgress },
          englishProgress: { ...defaultProgress.englishProgress, ...data.progress?.englishProgress },
          charactersProgress: { ...defaultProgress.charactersProgress, ...data.progress?.charactersProgress },
        },
        wrongBook: data.wrongBook || [],
        challengeProgress: data.challengeProgress || {},
        pinyinFavorites: data.pinyinFavorites || [],
        gamification: {
          ...defaultGamification,
          ...data.gamification,
          growth: { ...defaultGamification.growth, ...data.gamification?.growth },
          timeAttackBest: { ...(data.gamification?.timeAttackBest || {}) },
          dailyQuests: data.gamification?.dailyQuests || defaultGamification.dailyQuests,
          shop: {
            ...defaultGamification.shop,
            ...data.gamification?.shop,
            ownedStickers: data.gamification?.shop?.ownedStickers || {},
            ownedSkins: data.gamification?.shop?.ownedSkins || [],
          },
        },
      }
    }
  } catch (error) {
    console.error('Failed to load app data:', error)
  }
  return defaultData
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save app data:', error)
  }
}

export function clearAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear app data:', error)
  }
}

export function getTodayDateString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function checkAndUpdateStreak(data: AppData): AppData {
  const today = getTodayDateString()
  const lastDate = data.progress.lastActiveDate

  if (lastDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    if (lastDate === yesterdayStr) {
      data.progress.streak += 1
    } else if (lastDate !== today) {
      data.progress.streak = 1
    }

    data.progress.lastActiveDate = today
    data.progress.todayQuestions = 0
    data.progress.todayCorrect = 0
  }

  return data
}
