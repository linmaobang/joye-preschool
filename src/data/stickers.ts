export interface StickerDef {
  id: string
  name: string
  emoji: string
}

export interface StickerPack {
  id: string
  name: string
  emoji: string
  stickers: StickerDef[]
}

export const stickerPacks: StickerPack[] = [
  {
    id: 'hero',
    name: '英雄战士',
    emoji: '🦸',
    stickers: [
      { id: 'hero-1', name: '巨人英雄', emoji: '🦸' },
      { id: 'hero-2', name: '能量光线', emoji: '⚡' },
      { id: 'hero-3', name: '变身徽章', emoji: '⭐' },
      { id: 'hero-4', name: '小怪兽', emoji: '👾' },
      { id: 'hero-5', name: '英雄盾牌', emoji: '🛡️' },
      { id: 'hero-6', name: '胜利手势', emoji: '✊' },
    ],
  },
  {
    id: 'space',
    name: '太空探险',
    emoji: '🚀',
    stickers: [
      { id: 'space-1', name: '火箭', emoji: '🚀' },
      { id: 'space-2', name: '宇航员', emoji: '🧑‍🚀' },
      { id: 'space-3', name: '行星', emoji: '🪐' },
      { id: 'space-4', name: '飞碟', emoji: '🛸' },
      { id: 'space-5', name: '星星', emoji: '⭐' },
      { id: 'space-6', name: '月球', emoji: '🌙' },
    ],
  },
  {
    id: 'dino',
    name: '恐龙世界',
    emoji: '🦖',
    stickers: [
      { id: 'dino-1', name: '霸王龙', emoji: '🦖' },
      { id: 'dino-2', name: '腕龙', emoji: '🦕' },
      { id: 'dino-3', name: '喷火龙', emoji: '🐉' },
      { id: 'dino-4', name: '恐龙蛋', emoji: '🥚' },
      { id: 'dino-5', name: '热带丛林', emoji: '🌴' },
      { id: 'dino-6', name: '小蜥蜴', emoji: '🦎' },
    ],
  },
  {
    id: 'car',
    name: '汽车总动员',
    emoji: '🏎️',
    stickers: [
      { id: 'car-1', name: '跑车', emoji: '🏎️' },
      { id: 'car-2', name: '消防车', emoji: '🚒' },
      { id: 'car-3', name: '挖掘机', emoji: '🚜' },
      { id: 'car-4', name: '警车', emoji: '🚓' },
      { id: 'car-5', name: '巴士', emoji: '🚌' },
      { id: 'car-6', name: '摩托车', emoji: '🏍️' },
    ],
  },
]

export function getPackById(id: string): StickerPack | undefined {
  return stickerPacks.find(p => p.id === id)
}

export interface SkinConfig {
  id: string
  name: string
  emoji: string
  accent: string
  accentSoft: string
  gradient: string
  desc: string
}

export const skinConfigs: SkinConfig[] = [
  { id: '', name: '马卡龙', emoji: '🍬', accent: '#FF8FA3', accentSoft: '#FFE4EC', gradient: 'linear-gradient(135deg, #FFB5C5 0%, #DCD0FF 50%, #AED9E0 100%)', desc: '默认糖果配色' },
  { id: 'hero', name: '英雄战士', emoji: '🦸', accent: '#E63946', accentSoft: '#FDE2E4', gradient: 'linear-gradient(135deg, #E63946 0%, #F4A261 55%, #2A9D8F 100%)', desc: '红金热血风' },
  { id: 'space', name: '太空探险', emoji: '🚀', accent: '#4361EE', accentSoft: '#E0E7FF', gradient: 'linear-gradient(135deg, #1B2A4A 0%, #3A0CA3 55%, #7209B7 100%)', desc: '深蓝星夜风' },
  { id: 'dino', name: '恐龙世界', emoji: '🦖', accent: '#2A9D8F', accentSoft: '#D8F3DC', gradient: 'linear-gradient(135deg, #2A9D8F 0%, #606C38 55%, #BC6C25 100%)', desc: '森林恐龙风' },
]

export function getSkinById(id: string): SkinConfig {
  return skinConfigs.find(s => s.id === id) || skinConfigs[0]
}
