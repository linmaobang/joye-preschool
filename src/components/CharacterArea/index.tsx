import { Box, Text, Group, Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../stores/AppContext'
import { xpRequiredForLevel, getTitleForLevel } from '../../utils/gamification'
import { getSkinById } from '../../data/stickers'
import CoinIcon from '../CoinIcon'

export default function CharacterArea() {
  const navigate = useNavigate()
  const { gamification } = useApp()
  const { growth, coins } = gamification
  const title = getTitleForLevel(growth.level)
  const need = xpRequiredForLevel(growth.level)
  const pct = Math.min(100, Math.round((growth.xp / need) * 100))
  const skin = getSkinById(gamification.shop.activeSkin)

  return (
    <Box
      className="rounded-3xl p-4 text-white shadow-md animate-slide-up"
      style={{ background: skin.gradient }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Box
            className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl font-black shadow-inner"
          >
            {growth.level}
          </Box>
          <Box>
            <Text fw={800} size="lg" className="leading-tight">
              {title}
            </Text>
            <Text size="xs" className="text-white/90">
              Lv.{growth.level} · 最高连击 {growth.maxCombo}
            </Text>
          </Box>
        </Group>

        <Box
          className="flex items-center gap-1 bg-white/25 backdrop-blur-sm rounded-full px-3 py-2 cursor-pointer hover:bg-white/35 active:scale-95 transition-all"
          onClick={() => navigate('/shop')}
        >
          <CoinIcon size={20} className="text-amber-200" />
          <Text fw={800} size="lg" className="text-white">{coins}</Text>
        </Box>
      </Group>

      <Box className="mt-3" onClick={() => navigate('/collection')}>
        <Group justify="space-between" mb={4}>
          <Text size="xs" className="text-white/90">升级进度</Text>
          <Text size="xs" fw={700} className="text-white">
            {growth.xp} / {need}
          </Text>
        </Group>
        <Progress.Root size="lg" radius="xl" className="bg-white/30">
          <Progress.Section
            value={pct}
            color="white"
            className="transition-all duration-500"
          >
            <Progress.Label>{pct}%</Progress.Label>
          </Progress.Section>
        </Progress.Root>
      </Box>
    </Box>
  )
}
