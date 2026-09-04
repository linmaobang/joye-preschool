import { Card, Box, Text, Group, Button, Progress, Stack } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { getQuestLabel, getQuestEmoji } from '../../utils/gamification'
import CoinIcon from '../CoinIcon'

export default function DailyQuestCard() {
  const { gamification, claimQuest, claimAllQuests } = useApp()
  const { dailyQuests } = gamification
  const { quests, allClaimed } = dailyQuests
  const completedCount = quests.filter(q => q.completed).length
  const claimedCount = quests.filter(q => q.claimed).length

  return (
    <Card shadow="sm" padding="lg" radius="xl" className="border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <Box className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-white text-lg">
            🎯
          </Box>
          <Text fw={700} className="text-slate-800">今日任务</Text>
        </Group>
        <Text size="xs" fw={600} className="text-amber-600">
          已完成 {claimedCount} / {quests.length}
        </Text>
      </Group>

      <Stack gap="sm">
        {quests.map(quest => {
          const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100))
          return (
            <Box
              key={quest.id}
              className={`rounded-2xl p-3 border ${
                quest.claimed
                  ? 'bg-white border-emerald-200 opacity-70'
                  : quest.completed
                  ? 'bg-white border-amber-300'
                  : 'bg-white/70 border-slate-200'
              }`}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Text className="text-2xl">{getQuestEmoji(quest.type)}</Text>
                  <Box>
                    <Text size="sm" fw={600} className="text-slate-700">
                      {getQuestLabel(quest.type)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {quest.completed ? '已完成！' : `${quest.progress} / ${quest.target}`}
                    </Text>
                  </Box>
                </Group>
                {quest.claimed ? (
                  <Text size="xs" fw={700} className="text-emerald-500">已领取</Text>
                ) : quest.completed ? (
                  <Button
                    size="xs"
                    radius="xl"
                    color="amber"
                    onClick={() => claimQuest(quest.id)}
                    className="font-bold"
                  >
                    领取
                  </Button>
                ) : (
                  <Box className="flex items-center gap-1 bg-amber-100 rounded-full px-2 py-1">
                    <CoinIcon size={14} />
                    <Text size="xs" fw={700} className="text-amber-700">+{quest.rewardCoins}</Text>
                  </Box>
                )}
              </Group>
              {!quest.completed && (
                <Progress.Root size="xs" radius="xl" className="mt-2 bg-slate-200">
                  <Progress.Section value={pct} color="amber" />
                </Progress.Root>
              )}
            </Box>
          )
        })}

        {completedCount === quests.length && !allClaimed && (
          <Button
            size="md"
            radius="xl"
            variant="filled"
            color="orange"
            onClick={claimAllQuests}
            className="font-bold"
            leftSection={<span>🎁</span>}
          >
            领取全部奖励（+20 金币 / +50 经验）
          </Button>
        )}
        {allClaimed && (
          <Text size="xs" fw={700} className="text-center text-emerald-600">
            今日任务全部完成，太棒了！
          </Text>
        )}
      </Stack>
    </Card>
  )
}
