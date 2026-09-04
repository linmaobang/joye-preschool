import type { GrowthState, DailyQuestState, QuestType } from '../types'

// 升级所需经验：100 + (当前等级 - 1) × 50
export function xpRequiredForLevel(level: number): number {
  return 100 + (level - 1) * 50
}

// 称号体系
const TITLE_TIERS: [number, string][] = [
  [1, '学习小芽'],
  [4, '闯关新星'],
  [7, '智慧骑士'],
  [10, '数学小博士'],
  [13, '全能挑战家'],
  [16, '学习王者'],
  [20, '超级学霸'],
]

export function getTitleForLevel(level: number): string {
  let title = '学习小芽'
  for (const [minLevel, t] of TITLE_TIERS) {
    if (level >= minLevel) title = t
  }
  return title
}

export interface AddXpResult {
  growth: GrowthState
  levelsGained: number
  newTitle: string
}

// 纯函数：添加经验并处理升级，返回新的 growth 与升级信息
export function addXpPure(growth: GrowthState, amount: number): AddXpResult {
  let { xp, level } = growth
  xp += Math.max(0, amount)
  let levelsGained = 0
  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level)
    level += 1
    levelsGained += 1
  }
  return {
    growth: { ...growth, xp, level },
    levelsGained,
    newTitle: getTitleForLevel(level),
  }
}

// 连击加成：XP 额外 = 2×连击（上限10），金币额外 = 1×连击（上限5）
export function comboXpBonus(combo: number): number {
  if (combo < 3) return 0
  return Math.min(2 * combo, 10)
}

export function comboCoinBonus(combo: number): number {
  if (combo < 3) return 0
  return Math.min(combo, 5)
}

// 闯关星级对应金币
export function starsToCoins(stars: number): number {
  if (stars >= 3) return 30
  if (stars >= 2) return 15
  return 5
}

// ---------- 每日任务 ----------

const QUEST_DEFS: Record<QuestType, { target: number; label: string; emoji: string }> = {
  doQuestions: { target: 10, label: '做对 10 道题', emoji: '📝' },
  combo5: { target: 1, label: '连续答对 5 题', emoji: '🔥' },
  clearLevel: { target: 1, label: '闯过 1 个关卡', emoji: '🏰' },
  timeAttack: { target: 1, label: '完成 1 次限时挑战', emoji: '⏱️' },
  accuracy80: { target: 1, label: '一次练习正确率 80% 以上', emoji: '🎯' },
}

export function getQuestLabel(type: QuestType): string {
  return QUEST_DEFS[type].label
}

export function getQuestEmoji(type: QuestType): string {
  return QUEST_DEFS[type].emoji
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 生成某一天的 3 个任务：固定包含"做对 10 道题"，另从其余 4 类随机抽 2 个
export function createDailyQuests(date: string): DailyQuestState {
  const others = shuffle<QuestType>(['combo5', 'clearLevel', 'timeAttack', 'accuracy80']).slice(0, 2)
  const types: QuestType[] = ['doQuestions', ...others]
  const quests = types.map((type, i) => ({
    id: `quest-${date}-${i}`,
    type,
    target: QUEST_DEFS[type].target,
    progress: 0,
    rewardCoins: 10,
    rewardXp: 30,
    completed: false,
    claimed: false,
  }))
  return { date, quests, allClaimed: false }
}
