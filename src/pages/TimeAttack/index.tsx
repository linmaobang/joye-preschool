import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Title, Text, Stack, Button, Group, Box, SimpleGrid, RingProgress, Badge } from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { useAudio } from '../../hooks/useAudio'
import { useGamification } from '../../hooks/useGamification'
import { generateQuestions, checkAnswer } from '../../utils/questionGenerator'
import type { Question, WrongQuestion } from '../../types'
import QuestionCard from '../../components/QuestionCard'
import ComboDisplay from '../../components/ComboDisplay'
import CoinIcon from '../../components/CoinIcon'
import { IconBack, IconPlay, IconRefresh } from '../../components/Icons'

type Mode = '10' | '20' | 'mixed'

const MODE_LABELS: Record<Mode, string> = {
  '10': '10以内',
  '20': '20以内',
  mixed: '混合',
}

const TIME = 60

function genQuestion(mode: Mode): Question {
  const types = mode === '10' ? ['mixed10'] : mode === '20' ? ['mixed20'] : ['mixed10', 'mixed20']
  return generateQuestions(types as never, 1)[0]
}

export default function TimeAttack() {
  const navigate = useNavigate()
  const { addWrongQuestion, completeTimeAttack, gamification } = useApp()
  const { playCorrect, playWrong, playCompletion } = useAudio()
  const { combo, lastGain, handleAnswer: handleGamificationAnswer, resetCombo } = useGamification()

  const [mode, setMode] = useState<Mode>('10')
  const [stage, setStage] = useState<'select' | 'playing' | 'result'>('select')
  const [timeLeft, setTimeLeft] = useState(TIME)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  // 记录本次最高连击
  useEffect(() => {
    setSessionMaxCombo(prev => Math.max(prev, combo))
  }, [combo])

  const startGame = useCallback((m: Mode) => {
    setMode(m)
    setTimeLeft(TIME)
    setScore(0)
    setSelected(null)
    setIsAnswered(false)
    setSessionMaxCombo(0)
    setIsNewRecord(false)
    resetCombo()
    setQuestion(genQuestion(m))
    setStage('playing')
  }, [resetCombo])

  // 倒计时
  useEffect(() => {
    if (stage !== 'playing') return
    if (timeLeft <= 0) {
      setStage('result')
      playCompletion()
      const newRecord = completeTimeAttack(mode, score)
      setIsNewRecord(newRecord)
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, stage, mode, score, playCompletion, completeTimeAttack])

  const handleAnswer = useCallback((answer: number | string) => {
    if (isAnswered || !question || stage !== 'playing') return
    setSelected(answer)
    setIsAnswered(true)

    const isCorrect = checkAnswer(question, answer)
    handleGamificationAnswer(isCorrect)

    if (isCorrect) {
      setScore(prev => prev + 1)
      playCorrect()
    } else {
      playWrong()
      const wrongQuestion: WrongQuestion = {
        id: question.id,
        question,
        userAnswer: answer,
        correctAnswer: question.answer,
        timestamp: Date.now(),
        retryCount: 0,
      }
      addWrongQuestion(wrongQuestion)
    }

    // 短暂反馈后自动下一题
    setTimeout(() => {
      setQuestion(genQuestion(mode))
      setSelected(null)
      setIsAnswered(false)
    }, 550)
  }, [isAnswered, question, stage, mode, handleGamificationAnswer, playCorrect, playWrong, addWrongQuestion])

  const timePct = Math.round((timeLeft / TIME) * 100)
  const danger = timeLeft <= 10
  const best = gamification.timeAttackBest[mode] || 0

  // ---------- 选择模式 ----------
  if (stage === 'select') {
    return (
      <Stack gap="lg" className="px-1">
        <Box className="text-center py-2">
          <Group justify="center" gap="sm" mb="xs">
            <Box className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white">
              <IconPlay size={20} />
            </Box>
          </Group>
          <Title order={2} className="text-xl font-semibold text-slate-800">限时挑战</Title>
          <Text c="dimmed" size="sm" mt="xs">60 秒能答对几题？</Text>
        </Box>

        <Card shadow="none" padding="lg" radius="xl" className="border border-slate-100">
          <Text fw={600} size="sm" className="text-slate-700 mb-3">选择难度</Text>
          <SimpleGrid cols={3} spacing="sm">
            {(Object.keys(MODE_LABELS) as Mode[]).map(m => (
              <Button
                key={m}
                variant={mode === m ? 'filled' : 'light'}
                color="red"
                radius="xl"
                size="md"
                onClick={() => setMode(m)}
                className={mode === m ? '' : 'text-gray-700'}
              >
                {MODE_LABELS[m]}
              </Button>
            ))}
          </SimpleGrid>
          <Text size="xs" c="dimmed" mt="sm">答对一题 +10 经验 +1 金币，答错自动下一题</Text>
        </Card>

        <Button
          size="xl"
          radius="xl"
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold min-h-[60px] text-lg"
          onClick={() => startGame(mode)}
          rightSection={<IconPlay size={20} />}
        >
          开始挑战！
        </Button>

        <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Box className="h-4" />
      </Stack>
    )
  }

  // ---------- 结算 ----------
  if (stage === 'result') {
    return (
      <Stack gap="lg" align="center" className="py-4 px-2">
        <Box className="w-16 h-16 rounded-2xl flex items-center justify-center text-white animate-bounce-in bg-gradient-to-br from-amber-400 to-orange-500">
          <span className="text-3xl">{isNewRecord ? '🏆' : '⏱️'}</span>
        </Box>
        <Title order={2} className="text-center text-slate-800 animate-slide-up">
          {isNewRecord ? '新纪录！太厉害了！' : '挑战结束！'}
        </Title>

        <Card shadow="none" padding="xl" radius="xl" className="w-full max-w-md animate-slide-up stagger-2 border border-slate-100">
          <Stack align="center" gap="md">
            <Text fw={800} size="5xl" className="text-red-500">{score} <span className="text-2xl text-slate-400">题</span></Text>
            <Group gap="xl">
              <Stack align="center" gap={0}>
                <Text fw={700} size="lg" className="text-orange-500">🔥 {sessionMaxCombo}</Text>
                <Text size="xs" c="dimmed">最高连击</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text fw={700} size="lg" className="text-amber-600">
                  {best} <span className="text-sm">题</span>
                </Text>
                <Text size="xs" c="dimmed">最好成绩</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Box className="flex items-center gap-1">
                  <CoinIcon size={16} />
                  <Text fw={700} size="lg" className="text-amber-600">+{score}</Text>
                </Box>
                <Text size="xs" c="dimmed">金币</Text>
              </Stack>
            </Group>
            {isNewRecord && (
              <Badge size="lg" color="amber" variant="filled" className="font-bold">打破纪录！</Badge>
            )}
          </Stack>
        </Card>

        <Group className="w-full max-w-md" grow>
          <Button variant="light" color="gray" size="lg" leftSection={<IconBack size={18} />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button
            variant="filled"
            color="red"
            size="lg"
            leftSection={<IconRefresh size={18} />}
            onClick={() => startGame(mode)}
            className="font-bold"
          >
            再来一局
          </Button>
        </Group>
      </Stack>
    )
  }

  // ---------- 进行中 ----------
  return (
    <Stack gap="md" className="px-1">
      <Group justify="space-between" align="center">
        <Badge size="lg" color="red" variant="light">{MODE_LABELS[mode]}速算</Badge>
        <Button variant="subtle" size="sm" onClick={() => { resetCombo(); setStage('select') }}>退出</Button>
      </Group>

      <Group justify="center" className="py-1">
        <RingProgress
          size={96}
          thickness={8}
          roundCaps
          sections={[{ value: timePct, color: danger ? 'red' : 'teal' }]}
          label={
            <Text ta="center" fw={800} size={danger ? 'xl' : 'lg'} className={danger ? 'text-red-500 animate-pulse' : 'text-teal-600'}>
              {timeLeft}s
            </Text>
          }
        />
        <Stack gap={0} align="center">
          <Text fw={800} size="3xl" className="text-slate-800">{score}</Text>
          <Text size="xs" c="dimmed">答对题数</Text>
        </Stack>
      </Group>

      <ComboDisplay combo={combo} gain={lastGain} />

      {question && (
        <QuestionCard
          question={question}
          selectedAnswer={selected}
          isAnswered={isAnswered}
          onAnswer={handleAnswer}
        />
      )}

      <Box className="h-4" />
    </Stack>
  )
}
