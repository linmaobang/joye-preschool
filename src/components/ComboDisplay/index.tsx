import { Box, Text } from '@mantine/core'
import CoinIcon from '../CoinIcon'
import type { AnswerGain } from '../../hooks/useGamification'

interface ComboDisplayProps {
  combo: number
  gain: AnswerGain | null
}

export default function ComboDisplay({ combo, gain }: ComboDisplayProps) {
  const showCombo = combo >= 3
  const levelText =
    combo >= 10 ? { text: '无敌啦！', cls: 'text-red-500' }
    : combo >= 6 ? { text: '超厉害！', cls: 'text-orange-500' }
    : { text: '太棒了！', cls: 'text-amber-500' }

  return (
    <Box className="flex items-center justify-center gap-2 py-1 min-h-[40px]">
      {showCombo && (
        <>
          <span className="text-2xl animate-wiggle inline-block">🔥</span>
          <Text fw={800} size="xl" className={`${levelText.cls} animate-pop`}>
            {levelText.text}{combo} 连击！
          </Text>
        </>
      )}
      {gain && combo >= 1 && (
        <Box className="flex items-center gap-1 ml-2 animate-bounce-in">
          <Text fw={700} size="sm" className="text-emerald-500">+{gain.xp}经验</Text>
          <Box className="flex items-center gap-0.5">
            <CoinIcon size={14} />
            <Text fw={700} size="sm" className="text-amber-600">+{gain.coins}</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
