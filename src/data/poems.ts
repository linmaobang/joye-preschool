export interface Poem {
  id: string
  title: string
  author: string
  dynasty: string
  emoji: string
  lines: string[]
  pinyin: string[]
  difficulty: 1 | 2 | 3
}

export const difficultyLabels: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '朗朗上口', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  2: { label: '轻松背诵', color: 'text-amber-600', bg: 'bg-amber-100' },
  3: { label: '小小挑战', color: 'text-rose-600', bg: 'bg-rose-100' },
}

// 12 首幼小衔接经典古诗，拼音已按古诗语境校对多音字
export const poems: Poem[] = [
  {
    id: 'poem-yonge',
    title: '咏鹅',
    author: '骆宾王',
    dynasty: '唐',
    emoji: '🦢',
    difficulty: 1,
    lines: ['鹅鹅鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'],
    pinyin: ['é é é，', 'qū xiàng xiàng tiān gē。', 'bái máo fú lǜ shuǐ，', 'hóng zhǎng bō qīng bō。'],
  },
  {
    id: 'poem-jingyesi',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    emoji: '🌙',
    difficulty: 1,
    lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'],
    pinyin: ['chuáng qián míng yuè guāng，', 'yí shì dì shàng shuāng。', 'jǔ tóu wàng míng yuè，', 'dī tóu sī gù xiāng。'],
  },
  {
    id: 'poem-chunxiao',
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    emoji: '🌸',
    difficulty: 1,
    lines: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'],
    pinyin: ['chūn mián bù jué xiǎo，', 'chù chù wén tí niǎo。', 'yè lái fēng yǔ shēng，', 'huā luò zhī duō shǎo。'],
  },
  {
    id: 'poem-minnong',
    title: '悯农',
    author: '李绅',
    dynasty: '唐',
    emoji: '🌾',
    difficulty: 1,
    lines: ['锄禾日当午，', '汗滴禾下土。', '谁知盘中餐，', '粒粒皆辛苦。'],
    pinyin: ['chú hé rì dāng wǔ，', 'hàn dī hé xià tǔ。', 'shuí zhī pán zhōng cān，', 'lì lì jiē xīn kǔ。'],
  },
  {
    id: 'poem-hua',
    title: '画',
    author: '王维',
    dynasty: '唐',
    emoji: '🖼️',
    difficulty: 1,
    lines: ['远看山有色，', '近听水无声。', '春去花还在，', '人来鸟不惊。'],
    pinyin: ['yuǎn kàn shān yǒu sè，', 'jìn tīng shuǐ wú shēng。', 'chūn qù huā hái zài，', 'rén lái niǎo bù jīng。'],
  },
  {
    id: 'poem-dengguanquelou',
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    emoji: '🏯',
    difficulty: 2,
    lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'],
    pinyin: ['bái rì yī shān jìn，', 'huáng hé rù hǎi liú。', 'yù qióng qiān lǐ mù，', 'gèng shàng yī céng lóu。'],
  },
  {
    id: 'poem-jiangnan',
    title: '江南',
    author: '汉乐府',
    dynasty: '汉',
    emoji: '🪷',
    difficulty: 2,
    lines: ['江南可采莲，', '莲叶何田田。', '鱼戏莲叶间。', '鱼戏莲叶东，', '鱼戏莲叶西，', '鱼戏莲叶南，', '鱼戏莲叶北。'],
    pinyin: ['jiāng nán kě cǎi lián，', 'lián yè hé tián tián。', 'yú xì lián yè jiān。', 'yú xì lián yè dōng，', 'yú xì lián yè xī，', 'yú xì lián yè nán，', 'yú xì lián yè běi。'],
  },
  {
    id: 'poem-feng',
    title: '风',
    author: '李峤',
    dynasty: '唐',
    emoji: '🌬️',
    difficulty: 2,
    lines: ['解落三秋叶，', '能开二月花。', '过江千尺浪，', '入竹万竿斜。'],
    pinyin: ['jiě luò sān qiū yè，', 'néng kāi èr yuè huā。', 'guò jiāng qiān chǐ làng，', 'rù zhú wàn gān xié。'],
  },
  {
    id: 'poem-sancunyonghuai',
    title: '山村咏怀',
    author: '邵雍',
    dynasty: '宋',
    emoji: '⛰️',
    difficulty: 2,
    lines: ['一去二三里，', '烟村四五家。', '亭台六七座，', '八九十枝花。'],
    pinyin: ['yī qù èr sān lǐ，', 'yān cūn sì wǔ jiā。', 'tíng tái liù qī zuò，', 'bā jiǔ shí zhī huā。'],
  },
  {
    id: 'poem-chishang',
    title: '池上',
    author: '白居易',
    dynasty: '唐',
    emoji: '🛶',
    difficulty: 2,
    lines: ['小娃撑小艇，', '偷采白莲回。', '不解藏踪迹，', '浮萍一道开。'],
    pinyin: ['xiǎo wá chēng xiǎo tǐng，', 'tōu cǎi bái lián huí。', 'bù jiě cáng zōng jì，', 'fú píng yī dào kāi。'],
  },
  {
    id: 'poem-gulangyuexing',
    title: '古朗月行',
    author: '李白',
    dynasty: '唐',
    emoji: '🌕',
    difficulty: 3,
    lines: ['小时不识月，', '呼作白玉盘。', '又疑瑶台镜，', '飞在青云端。'],
    pinyin: ['xiǎo shí bù shí yuè，', 'hū zuò bái yù pán。', 'yòu yí yáo tái jìng，', 'fēi zài qīng yún duān。'],
  },
  {
    id: 'poem-jiangxue',
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    emoji: '❄️',
    difficulty: 3,
    lines: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'],
    pinyin: ['qiān shān niǎo fēi jué，', 'wàn jìng rén zōng miè。', 'gū zhōu suō lì wēng，', 'dú diào hán jiāng xuě。'],
  },
]

export function getPoemById(id: string): Poem | undefined {
  return poems.find(p => p.id === id)
}
