import { Modal, Title, Text, Box } from '@mantine/core'
import type { LevelUpInfo } from '../../types'

interface LevelUpModalProps {
  info: LevelUpInfo | null
  onClose: () => void
}

export default function LevelUpModal({ info, onClose }: LevelUpModalProps) {
  return (
    <Modal
      opened={!!info}
      onClose={onClose}
      withCloseButton={false}
      centered
      radius="xl"
      padding={0}
    >
      {info && (
        <Box className="text-center bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 rounded-[24px] overflow-hidden">
          <Box className="px-8 py-10">
            <div className="text-7xl mb-4 animate-bounce-in">🎉</div>
            <Title order={2} className="text-white mb-2 drop-shadow">
              升级啦！
            </Title>
            <Text size="lg" className="text-white/95 font-semibold">
              等级 {info.fromLevel} → {info.toLevel}
            </Text>
            <Box className="my-4 bg-white/20 rounded-2xl px-4 py-3">
              <Text size="sm" className="text-white/90">新称号</Text>
              <Text size="xl" fw={800} className="text-white mt-1">
                {info.title}
              </Text>
            </Box>
            <button
              onClick={onClose}
              className="mt-4 bg-white text-orange-500 font-bold text-lg rounded-2xl px-10 py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              太棒了！
            </button>
          </Box>
        </Box>
      )}
    </Modal>
  )
}
