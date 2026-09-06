import { useNavigate } from 'react-router-dom'
import { Card, Title, Text, Stack, Button, Group, Box, SimpleGrid, Badge } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { poems, difficultyLabels } from '../../data/poems'
import { IconBack } from '../../components/Icons'

export default function Poems() {
  const navigate = useNavigate()
  const { progress } = useApp()
  const learnedList = progress.poemsLearned || []

  return (
    <Stack gap="md" className="px-1">
      <Box className="text-center py-2">
        <Group justify="center" gap="sm" mb="xs">
          <Box className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white text-xl">
            📜
          </Box>
        </Group>
        <Title order={2} className="text-xl font-semibold text-slate-800">古诗乐园</Title>
        <Text c="dimmed" size="sm" mt="xs">听读经典古诗，学会一首得奖励</Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="xl" className="bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200">
        <Group justify="center" gap="sm">
          <Text fw={800} size="lg" className="text-amber-700">
            🎖️ 已学会 {learnedList.length} / {poems.length} 首
          </Text>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {poems.map(poem => {
          const learned = learnedList.includes(poem.id)
          const diff = difficultyLabels[poem.difficulty]
          return (
            <Card
              key={poem.id}
              shadow="none"
              padding="md"
              radius="xl"
              className={`border cursor-pointer hover:shadow-md active:scale-[0.98] transition-all ${
                learned ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-100'
              }`}
              onClick={() => navigate(`/poems/${poem.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Text className="text-3xl">{poem.emoji}</Text>
                  <Box>
                    <Text fw={700} className="text-slate-800">{poem.title}</Text>
                    <Text size="xs" c="dimmed">{poem.dynasty} · {poem.author}</Text>
                  </Box>
                </Group>
                <Stack align="flex-end" gap={4}>
                  {learned ? (
                    <Badge size="sm" color="amber" variant="filled">✓ 已学会</Badge>
                  ) : (
                    <Badge size="sm" color="gray" variant="light">未学</Badge>
                  )}
                  <Badge size="xs" variant="light" className={diff.bg}>
                    <span className={diff.color}>{diff.label}</span>
                  </Badge>
                </Stack>
              </Group>
            </Card>
          )
        })}
      </SimpleGrid>

      <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)} className="min-h-[52px]">
        返回
      </Button>

      <Box className="h-4" />
    </Stack>
  )
}
