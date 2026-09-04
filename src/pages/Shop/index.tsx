import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Title, Text, Stack, Button, Group, Box, SimpleGrid, Badge, Modal } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { stickerPacks, skinConfigs } from '../../data/stickers'
import CoinIcon from '../../components/CoinIcon'
import { IconBack } from '../../components/Icons'

const STICKER_PRICE = 30
const SKIN_PRICE = 80

export default function Shop() {
  const navigate = useNavigate()
  const { gamification, buyStickerPack, buySkin, setActiveSkin } = useApp()
  const { coins, shop } = gamification
  const [openResult, setOpenResult] = useState<{ newStickers: string[]; refund: number; packName: string; packEmoji: string } | null>(null)
  const [insufficient, setInsufficient] = useState(false)

  const handleBuyPack = (packId: string) => {
    const result = buyStickerPack(packId)
    if (!result) {
      if (coins < STICKER_PRICE) setInsufficient(true)
      return
    }
    if (result.newStickers.length === 0) return
    const pack = stickerPacks.find(p => p.id === packId)
    setOpenResult({
      newStickers: result.newStickers,
      refund: result.refund,
      packName: pack?.name || '',
      packEmoji: pack?.emoji || '',
    })
  }

  const handleBuySkin = (skinId: string) => {
    const ok = buySkin(skinId)
    if (!ok) setInsufficient(true)
  }

  return (
    <Stack gap="md" className="px-1">
      <Box className="text-center py-2">
        <Group justify="center" gap="sm" mb="xs">
          <Box className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
            <CoinIcon size={22} className="text-white" />
          </Box>
        </Group>
        <Title order={2} className="text-xl font-semibold text-slate-800">奖励商店</Title>
        <Text c="dimmed" size="sm" mt="xs">用金币兑换贴纸和装扮</Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="xl" className="bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200">
        <Group justify="center" gap="sm">
          <CoinIcon size={28} />
          <Text fw={800} size="xl" className="text-amber-700">{coins} 金币</Text>
        </Group>
      </Card>

      {/* 贴纸包 */}
      <Box>
        <Group gap="sm" mb="sm">
          <Text size="sm" fw={700} className="text-slate-700">🖼️ 贴纸收藏（30 金币兑换 1 张）</Text>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {stickerPacks.map(pack => {
            const owned = shop.ownedStickers[pack.id] || []
            const complete = owned.length >= pack.stickers.length
            const disabled = complete || coins < STICKER_PRICE
            return (
              <Card key={pack.id} shadow="none" padding="md" radius="xl" className="border border-slate-100 hover:shadow-md transition-shadow">
                <Stack align="center" gap="xs">
                  <Text className="text-4xl">{pack.emoji}</Text>
                  <Text fw={700} size="sm" className="text-slate-800">{pack.name}</Text>
                  <Text size="xs" c="dimmed">
                    {complete ? '已集齐！' : `已收集 ${owned.length} / ${pack.stickers.length}`}
                  </Text>
                  <Button
                    size="sm"
                    radius="xl"
                    fullWidth
                    disabled={disabled}
                    onClick={() => handleBuyPack(pack.id)}
                    className={`whitespace-nowrap font-bold ${
                      complete
                        ? 'bg-gray-100 text-gray-500'
                        : disabled
                          ? 'bg-amber-50 text-amber-500 border-2 border-amber-200'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow hover:shadow-md'
                    }`}
                    leftSection={<CoinIcon size={14} />}
                  >
                    {complete ? '已集齐' : `${STICKER_PRICE} 金币`}
                  </Button>
                </Stack>
              </Card>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* 主题皮肤 */}
      <Box>
        <Group gap="sm" mb="sm">
          <Text size="sm" fw={700} className="text-slate-700">🎨 主题皮肤</Text>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {skinConfigs.map(skin => {
            const owned = skin.id === '' || shop.ownedSkins.includes(skin.id)
            const active = shop.activeSkin === skin.id
            const disabled = !owned && coins < SKIN_PRICE
            return (
              <Card
                key={skin.id || 'default'}
                shadow="none"
                padding="md"
                radius="xl"
                className={`border transition-all ${active ? 'border-2 border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-100'}`}
              >
                <Stack align="center" gap="xs">
                  <Box
                    className="w-16 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner"
                    style={{ background: skin.gradient }}
                  >
                    {skin.emoji}
                  </Box>
                  <Text fw={700} size="sm" className="text-slate-800">{skin.name}</Text>
                  <Text size="xs" c="dimmed" ta="center">{skin.desc}</Text>
                  {active ? (
                    <Badge size="md" color="indigo" variant="light">使用中</Badge>
                  ) : owned ? (
                    <Button size="xs" radius="xl" color="indigo" fullWidth onClick={() => setActiveSkin(skin.id)}>
                      使用
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      radius="xl"
                      fullWidth
                      disabled={disabled}
                      onClick={() => handleBuySkin(skin.id)}
                      className={`whitespace-nowrap font-bold ${
                        disabled
                          ? 'bg-amber-50 text-amber-500 border-2 border-amber-200'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow'
                      }`}
                      leftSection={<CoinIcon size={12} />}
                    >
                      {SKIN_PRICE} 金币
                    </Button>
                  )}
                </Stack>
              </Card>
            )
          })}
        </SimpleGrid>
      </Box>

      <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)} className="min-h-[52px]">
        返回
      </Button>

      {/* 开包结果弹窗 */}
      <Modal opened={!!openResult} onClose={() => setOpenResult(null)} withCloseButton={false} centered radius="xl">
        {openResult && (
          <Stack align="center" gap="md" className="py-4">
            <Text fw={800} size="xl" className="text-amber-600">开包成功！</Text>
            <Text size="sm" c="dimmed">{openResult.packEmoji} {openResult.packName} 获得：</Text>
            <Group gap="md">
              {openResult.newStickers.map((id, i) => {
                const pack = stickerPacks.find(p => p.stickers.some(s => s.id === id))
                const st = pack?.stickers.find(s => s.id === id)
                return (
                  <Stack key={id} align="center" gap={4}>
                    <Box
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-amber-200 flex items-center justify-center shadow-inner animate-fade-in"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <Text className="text-5xl animate-sticker-pop" style={{ animationDelay: `${i * 0.15}s` }}>
                        {st?.emoji}
                      </Text>
                    </Box>
                    <Text size="xs" fw={600} className="text-slate-700 animate-fade-in" style={{ animationDelay: `${i * 0.15 + 0.25}s` }}>
                      {st?.name}
                    </Text>
                  </Stack>
                )
              })}
            </Group>
            {openResult.refund > 0 && (
              <Text size="sm" fw={600} className="text-emerald-600">
                抽到重复贴纸，返还 +{openResult.refund} 金币
              </Text>
            )}
            <Button color="amber" radius="xl" onClick={() => setOpenResult(null)}>太好了！</Button>
          </Stack>
        )}
      </Modal>

      {/* 金币不足提示 */}
      <Modal opened={insufficient} onClose={() => setInsufficient(false)} centered radius="xl" title="金币不足">
        <Stack gap="md">
          <Text>再多做几道题、闯几关就能攒够金币啦！</Text>
          <Button color="amber" radius="xl" onClick={() => setInsufficient(false)}>知道了</Button>
        </Stack>
      </Modal>

      <Box className="h-4" />
    </Stack>
  )
}
