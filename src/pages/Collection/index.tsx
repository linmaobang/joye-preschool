import { useNavigate } from 'react-router-dom'
import { Card, Title, Text, Stack, Button, Group, Box, SimpleGrid, Badge } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { stickerPacks } from '../../data/stickers'
import { IconBack } from '../../components/Icons'

export default function Collection() {
  const navigate = useNavigate()
  const { gamification } = useApp()
  const { shop } = gamification

  const totalOwned = stickerPacks.reduce((sum, p) => sum + (shop.ownedStickers[p.id] || []).length, 0)
  const totalCount = stickerPacks.reduce((sum, p) => sum + p.stickers.length, 0)

  return (
    <Stack gap="md" className="px-1">
      <Box className="text-center py-2">
        <Group justify="center" gap="sm" mb="xs">
          <Box className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white text-xl">
            📔
          </Box>
        </Group>
        <Title order={2} className="text-xl font-semibold text-slate-800">贴纸收藏墙</Title>
        <Text c="dimmed" size="sm" mt="xs">集齐一套点亮图鉴，得 50 金币奖励</Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="xl" className="bg-gradient-to-r from-pink-100 to-rose-50 border border-pink-200">
        <Group justify="center" gap="sm">
          <Text fw={800} size="lg" className="text-pink-600">
            {totalOwned} / {totalCount} 张贴纸
          </Text>
        </Group>
      </Card>

      {stickerPacks.map(pack => {
        const owned = shop.ownedStickers[pack.id] || []
        const complete = owned.length >= pack.stickers.length
        return (
          <Card key={pack.id} shadow="none" padding="lg" radius="xl" className="border border-slate-100">
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <Text className="text-2xl">{pack.emoji}</Text>
                <Text fw={700} className="text-slate-800">{pack.name}</Text>
                <Text size="xs" c="dimmed">{owned.length} / {pack.stickers.length}</Text>
              </Group>
              {complete && (
                <Badge size="md" color="amber" variant="filled">已集齐 +50</Badge>
              )}
            </Group>
            <SimpleGrid cols={3} spacing="sm">
              {pack.stickers.map(sticker => {
                const has = owned.includes(sticker.id)
                return (
                  <Box
                    key={sticker.id}
                    className={`rounded-2xl p-3 flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                      has
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm'
                        : 'bg-slate-50 border-dashed border-slate-200'
                    }`}
                  >
                    <Text className={`text-4xl ${has ? 'animate-pop' : 'opacity-30 grayscale'}`}>
                      {has ? sticker.emoji : '❓'}
                    </Text>
                    <Text size="xs" fw={600} className={has ? 'text-slate-700' : 'text-slate-400'}>
                      {has ? sticker.name : '???'}
                    </Text>
                  </Box>
                )
              })}
            </SimpleGrid>
          </Card>
        )
      })}

      <Group grow>
        <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)} className="min-h-[52px]">
          返回
        </Button>
        <Button color="pink" size="lg" onClick={() => navigate('/shop')} className="min-h-[52px]">
          🪙 去商店兑换
        </Button>
      </Group>

      <Box className="h-4" />
    </Stack>
  )
}
