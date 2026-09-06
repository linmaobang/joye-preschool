import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Title, Text, Stack, Button, Group, Box, Badge, Modal } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { getPoemById, difficultyLabels } from '../../data/poems'
import { IconBack } from '../../components/Icons'

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { progress, markPoemLearned } = useApp()
  const [rewardModal, setRewardModal] = useState(false)
  const poem = getPoemById(id || '')

  if (!poem) {
    return (
      <Stack align="center" gap="md" className="px-1 py-10">
        <Text c="dimmed">没有找到这首古诗</Text>
        <Button variant="light" color="gray" onClick={() => navigate('/poems')}>返回古诗乐园</Button>
      </Stack>
    )
  }

  const learned = (progress.poemsLearned || []).includes(poem.id)
  const diff = difficultyLabels[poem.difficulty]

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.85
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
  }

  const speakAll = () => {
    const text = `${poem.title}，${poem.dynasty}，${poem.author}。${poem.lines.join('')}`
    speak(text)
  }

  const handleLearned = () => {
    const ok = markPoemLearned(poem.id)
    if (ok) setRewardModal(true)
  }

  return (
    <Stack gap="md" className="px-1">
      <Box className="text-center py-2">
        <Text className="text-3xl mb-1">{poem.emoji}</Text>
        <Title order={2} className="text-2xl font-bold text-slate-800">{poem.title}</Title>
        <Text c="dimmed" size="sm" mt={2}>{poem.dynasty} · {poem.author}</Text>
        <Badge size="sm" variant="light" mt="xs" className={diff.bg}>
          <span className={diff.color}>{diff.label}</span>
        </Badge>
      </Box>

      {/* 古诗正文 */}
      <Card shadow="md" padding="xl" radius="xl" className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <Stack align="center" gap="md">
          {poem.lines.map((line, i) => (
            <Group key={i} justify="center" gap="sm" wrap="nowrap" className="w-full">
              <Stack gap={0} align="center" className="flex-1">
                <Text size="xs" className="text-amber-500/80 tracking-wide">{poem.pinyin[i]}</Text>
                <Text size="xl" fw={700} className="text-slate-800 tracking-[0.2em]">{line}</Text>
              </Stack>
              <Button
                size="xs"
                variant="subtle"
                radius="xl"
                color="amber"
                className="flex-shrink-0"
                onClick={() => speak(line)}
                aria-label={`朗读这句`}
              >
                ▶️
              </Button>
            </Group>
          ))}
        </Stack>
      </Card>

      {/* 操作区 */}
      <Stack gap="sm">
        <Button
          size="lg"
          radius="xl"
          color="amber"
          variant="filled"
          className="min-h-[56px] bg-gradient-to-r from-amber-400 to-orange-500"
          leftSection={<span className="text-lg">🔊</span>}
          onClick={speakAll}
        >
          整首朗读
        </Button>

        {learned ? (
          <Badge size="lg" color="amber" variant="filled" className="mx-auto px-6 py-2 text-base">
            ✅ 已经学会啦！
          </Badge>
        ) : (
          <Button
            size="lg"
            radius="xl"
            color="emerald"
            className="min-h-[56px]"
            leftSection={<span className="text-lg">🎖️</span>}
            onClick={handleLearned}
          >
            我学会了！（+20 经验 +3 金币）
          </Button>
        )}
        <Text size="xs" c="dimmed" ta="center">跟着朗读几遍，再点"我学会了"</Text>
      </Stack>

      <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)} className="min-h-[52px]">
        返回
      </Button>

      {/* 学会奖励弹窗 */}
      <Modal opened={rewardModal} onClose={() => setRewardModal(false)} withCloseButton={false} centered radius="xl">
        <Stack align="center" gap="md" className="py-4">
          <Text className="text-5xl">🎉</Text>
          <Text fw={800} size="xl" className="text-amber-600">太棒了！</Text>
          <Text size="sm" c="dimmed">你学会了《{poem.title}》</Text>
          <Group gap="lg">
            <Stack align="center" gap={0}>
              <Text fw={800} size="lg" className="text-orange-500">+20</Text>
              <Text size="xs" c="dimmed">经验</Text>
            </Stack>
            <Stack align="center" gap={0}>
              <Text fw={800} size="lg" className="text-amber-500">+3</Text>
              <Text size="xs" c="dimmed">金币</Text>
            </Stack>
          </Group>
          <Button color="amber" radius="xl" onClick={() => setRewardModal(false)}>继续加油！</Button>
        </Stack>
      </Modal>

      <Box className="h-4" />
    </Stack>
  )
}
