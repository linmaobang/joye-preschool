export type FontSize = 'small' | 'medium' | 'large'
export type Theme = 'cartoon'
export type OperationType = 'addition' | 'subtraction' | 'mixed'

export type MathQuestionType = 
  | 'addition10'
  | 'subtraction10'
  | 'mixed10'
  | 'addition20'
  | 'subtraction20'
  | 'mixed20'
  | 'decompose'
  | 'adjacent'
  | 'compare'
  | 'wordProblem'
  | 'counting'
  | 'sequence'
  // ===== 经典题库扩展（源自 shiyi-math-practice，MIT）=====
  | 'shiyiAdd20'    // 20以内加法
  | 'shiyiSub20'    // 20以内减法
  | 'shiyiNumber'   // 100以内数的认识
  | 'shiyiCompare'  // 大小比较
  | 'shiyiAddSub'   // 100以内简单加减
  | 'shiyiMoney'    // 人民币
  | 'shiyiPattern'  // 找规律
  | 'shiyiObserve'  // 观察物体
  | 'shiyiShape'    // 有趣的图形
  | 'shiyiWord'     // 解决问题

export type PinyinQuestionType =
  | 'pinyinToChar'
  | 'charToPinyin'
  | 'toneMatch'
  | 'fillInitial'
  | 'fillFinal'
  | 'flatCurled'
  | 'spellTwo'
  | 'spellThree'

export type QuestionType = MathQuestionType | PinyinQuestionType

export type PinyinCategory = 
  | 'singleVowel'
  | 'compoundVowel'
  | 'nasalVowel'
  | 'initial'
  | 'wholeSyllable'

export type ToneType = 1 | 2 | 3 | 4 | 0

export interface PinyinItem {
  pinyin: string
  category: PinyinCategory
  audio?: string
  mouthShape?: string
  tips?: string
  isFlat?: boolean
  isCurled?: boolean
}

export interface PinyinSyllable {
  syllable: string
  initial?: string
  final: string
  medial?: string
  tone: ToneType
  char?: string
  charImage?: string
}

export interface Settings {
  fontSize: FontSize
  soundEnabled: boolean
  theme: Theme
  pinyinSpeed: 'slow' | 'normal' | 'fast'
  showSpellingHint: boolean
}

export interface Progress {
  totalQuestions: number
  correctAnswers: number
  streak: number
  lastActiveDate: string
  todayQuestions: number
  todayCorrect: number
  mathProgress: {
    totalQuestions: number
    correctAnswers: number
  }
  pinyinProgress: {
    totalQuestions: number
    correctAnswers: number
    learnedPinyin: string[]
  }
  englishProgress: {
    totalQuestions: number
    correctAnswers: number
    learnedWords: string[]
  }
  charactersProgress: {
    totalQuestions: number
    correctAnswers: number
    learnedChars: string[]
  }
}

export interface Question {
  id: string
  type: QuestionType
  module: 'math' | 'pinyin'
  content: string
  answer: number | string
  options?: (number | string)[]
  visual?: VisualData
  num1?: number
  num2?: number
  operator?: string
  pinyin?: string
  tone?: ToneType
  syllable?: PinyinSyllable
}

export interface VisualData {
  type: 'dots' | 'sticks' | 'fruits' | 'animals' | 'numberLine' | 'pinyinSpell' | 'emojiRows'
  count?: number
  items?: string[]
  range?: [number, number]
  initial?: string
  final?: string
  medial?: string
  caption?: string
  rows?: string[][]
}

export interface WrongQuestion {
  id: string
  question: Question
  userAnswer: number | string
  correctAnswer: number | string
  timestamp: number
  retryCount: number
}

export interface LevelConfig {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'challenge'
  questionTypes: QuestionType[]
  questionCount: number
  module: 'math' | 'pinyin' | 'comprehensive'
  timeLimit?: number
  unlockCondition?: string
}

export interface LevelProgress {
  stars: number
  completed: boolean
  bestScore?: number
  attempts: number
}

export interface ChallengeProgress {
  [levelId: string]: LevelProgress
}

export interface PinyinFavorite {
  pinyin: string
  addedAt: number
}

// ===================== 游戏化 =====================

export interface GrowthState {
  xp: number
  level: number
  maxCombo: number
}

export type QuestType = 'doQuestions' | 'combo5' | 'clearLevel' | 'timeAttack' | 'accuracy80'

export interface DailyQuest {
  id: string
  type: QuestType
  target: number
  progress: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
  claimed: boolean
}

export interface DailyQuestState {
  date: string
  quests: DailyQuest[]
  allClaimed: boolean
}

export interface ShopState {
  ownedStickers: Record<string, string[]>
  ownedSkins: string[]
  activeSkin: string
}

export interface Gamification {
  growth: GrowthState
  coins: number
  timeAttackBest: Record<string, number>
  dailyQuests: DailyQuestState
  shop: ShopState
}

export interface LevelUpInfo {
  fromLevel: number
  toLevel: number
  title: string
}

export interface AppData {
  settings: Settings
  progress: Progress
  wrongBook: WrongQuestion[]
  challengeProgress: ChallengeProgress
  pinyinFavorites: PinyinFavorite[]
  gamification: Gamification
}

export interface AppContextType {
  settings: Settings
  progress: Progress
  wrongBook: WrongQuestion[]
  challengeProgress: ChallengeProgress
  pinyinFavorites: PinyinFavorite[]
  gamification: Gamification
  levelUp: LevelUpInfo | null
  dismissLevelUp: () => void
  updateSettings: (settings: Partial<Settings>) => void
  updateProgress: (progress: Partial<Progress>) => void
  addWrongQuestion: (question: WrongQuestion) => void
  removeWrongQuestion: (id: string) => void
  clearWrongBook: () => void
  updateChallengeProgress: (levelId: string, progress: Partial<LevelProgress>) => void
  resetAllData: () => void
  recordAnswer: (isCorrect: boolean, module: 'math' | 'pinyin') => void
  addPinyinFavorite: (pinyin: string) => void
  removePinyinFavorite: (pinyin: string) => void
  markPinyinLearned: (pinyin: string) => void
  updatePinyinProgress: (totalQuestions: number, correctAnswers: number) => void
  updateEnglishProgress: (totalQuestions: number, correctAnswers: number) => void
  updateCharacterProgress: (totalQuestions: number, correctAnswers: number) => void
  markCharacterLearned: (char: string) => void
  // 游戏化方法
  onAnswerGamification: (isCorrect: boolean, combo: number) => void
  completePractice: (totalQuestions: number, correctAnswers: number) => void
  completeLevel: (stars: number) => void
  completeTimeAttack: (mode: string, score: number) => boolean
  claimQuest: (questId: string) => void
  claimAllQuests: () => void
  buyStickerPack: (packId: string) => { newStickers: string[]; refund: number } | null
  buySkin: (skinId: string) => boolean
  setActiveSkin: (skinId: string) => void
}
