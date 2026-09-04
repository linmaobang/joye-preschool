import { useState, useCallback } from 'react'
import { 
  Card, 
  Title, 
  Text, 
  Stack, 
  Button,
  Group,
  Box,
  Progress,
  SimpleGrid,
} from '@mantine/core'
import { useApp } from '../../stores/AppContext'
import { useAudio } from '../../hooks/useAudio'
import { useGamification } from '../../hooks/useGamification'
import ComboDisplay from '../../components/ComboDisplay'
import { getCharactersByGroup, characterStats, type CharacterItem, type CharacterGroup } from '../../data/characters'
import { IconRefresh, IconStar, IconCheck, IconArrowRight, IconPractice, IconPlay } from '../../components/Icons'

type QuestionType = 'charToPinyin' | 'pinyinToChar'

interface Question {
  char: CharacterItem
  type: QuestionType
  options: string[]
  answer: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateQuestions(group: CharacterGroup, count: number): Question[] {
  const pool = shuffle(getCharactersByGroup(group))
  const picked = pool.slice(0, count)
  const types: QuestionType[] = ['charToPinyin', 'pinyinToChar']
  return picked.map((item, i) => {
    const type = types[i % types.length]
    const distractors = pool.filter(p => p.char !== item.char && p.pinyin !== item.pinyin)
    const picked3 = shuffle(distractors).slice(0, 3)
    const options = type === 'charToPinyin'
      ? shuffle([...picked3.map(p => p.pinyin), item.pinyin])
      : shuffle([...picked3.map(p => p.char), item.char])
    return { char: item, type, options, answer: type === 'charToPinyin' ? item.pinyin : item.char }
  })
}

function speakChar(char: string) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(char)
    u.lang = 'zh-CN'
    u.rate = 0.75
    window.speechSynthesis.speak(u)
  } catch {
    /* 朗读失败不影响答题 */
  }
}

const groupInfo: Record<CharacterGroup, { label: string; desc: string }> = {
  easy: { label: '简单', desc: '基础高频字' },
  medium: { label: '中等', desc: '进阶常用字' },
  hard: { label: '困难', desc: '挑战生僻字' },
}

export default function CharacterPracticePage() {
  const { playCorrect, playWrong, playCompletion } = useAudio()
  const { updateCharacterProgress, markCharacterLearned, completePractice } = useApp()
  const { combo, lastGain, handleAnswer: handleAnswerGamification, resetCombo } = useGamification()

  const [stage, setStage] = useState<'select' | 'practice' | 'result'>('select')
  const [group, setGroup] = useState<CharacterGroup>('easy')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const startPractice = useCallback(() => {
    const qs = generateQuestions(group, questionCount)
    setQuestions(qs)
    setCurrentIndex(0)
    setCorrectCount(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setStage('practice')
    resetCombo()
  }, [group, questionCount, resetCombo])

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
    setIsAnswered(true)
    const isCorrect = answer === questions[currentIndex].answer
    handleAnswerGamification(isCorrect)
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
      markCharacterLearned(questions[currentIndex].char.char)
      playCorrect()
    } else {
      playWrong()
    }
  }, [isAnswered, questions, currentIndex, handleAnswerGamification, markCharacterLearned, playCorrect, playWrong])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      playCompletion()
      updateCharacterProgress(questions.length, correctCount)
      completePractice(questions.length, correctCount)
      setStage('result')
    }
  }, [currentIndex, questions.length, playCompletion, correctCount, updateCharacterProgress, completePractice])

  const handleRestart = () => setStage('select')

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

  if (stage === 'select') {
    return (
      <Stack gap="lg" className="px-1">
        <Box className="text-center py-2 animate-slide-up">
          <Group justify="center" gap="sm" mb="xs">
            <Box className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white shadow-md">
              <IconPractice size={20} />
            </Box>
          </Group>
          <Title order={3} className="text-lg font-bold text-gray-800">识字乐园</Title>
          <Text size="sm" className="text-gray-500">看字选音、看音选字 · {characterStats.easy + characterStats.medium + characterStats.hard} 个常用字</Text>
        </Box>

        <Card shadow="none" padding="lg" radius="xl" className="bg-white border-2 border-rose-100 animate-slide-up stagger-1">
          <Text fw={600} size="sm" className="text-gray-700 mb-3">选择难度</Text>
          <SimpleGrid cols={3} spacing="sm">
            {(Object.keys(groupInfo) as CharacterGroup[]).map((g) => (
              <Button
                key={g}
                variant={group === g ? 'filled' : 'light'}
                color="rose"
                radius="xl"
                size="md"
                className={group === g ? '' : 'text-gray-700'}
                onClick={() => setGroup(g)}
              >
                {groupInfo[g].label}
              </Button>
            ))}
          </SimpleGrid>
          <Text size="xs" className="text-gray-400 mt-2">
            {groupInfo[group].desc} · {characterStats[group]} 字
          </Text>
        </Card>

        <Card shadow="none" padding="lg" radius="xl" className="bg-white border-2 border-rose-100 animate-slide-up stagger-1">
          <Text fw={600} size="sm" className="text-gray-700 mb-4">选择题目数量</Text>
          <SimpleGrid cols={4} spacing="sm">
            {[5, 10, 15, 20].map((count) => (
              <Button
                key={count}
                variant={questionCount === count ? 'filled' : 'light'}
                color="rose"
                radius="xl"
                size="md"
                className={questionCount === count ? '' : 'text-gray-700'}
                onClick={() => setQuestionCount(count)}
              >
                {count}题
              </Button>
            ))}
          </SimpleGrid>
        </Card>

        <Button
          size="lg"
          radius="xl"
          className="animate-slide-up stagger-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold"
          onClick={startPractice}
          rightSection={<IconArrowRight size={18} />}
        >
          开始识字
        </Button>

        <Box className="h-4" />
      </Stack>
    )
  }

  if (stage === 'practice' && currentQuestion) {
    const getQuestionText = () => {
      return currentQuestion.type === 'charToPinyin'
        ? '读一读这个字，选出正确的拼音'
        : '看看拼音，选出对应的汉字'
    }

    return (
      <Stack gap="lg" className="px-1">
        <Box className="animate-slide-up">
          <Group justify="space-between" mb="xs">
            <Text size="sm" className="text-gray-500">第 {currentIndex + 1} / {questions.length} 题</Text>
            <Text size="sm" className="text-gray-500">正确 {correctCount} 题</Text>
          </Group>
          <Progress value={progress} size="sm" radius="xl" color="rose" />
        </Box>

        <ComboDisplay combo={combo} gain={lastGain} />

        <Card shadow="md" padding="xl" radius="xl" className="bg-white border-2 border-rose-100 animate-slide-up stagger-1">
          <Stack align="center" gap="md">
            <Text size="sm" className="text-gray-500">{getQuestionText()}</Text>

            {currentQuestion.type === 'charToPinyin' ? (
              <Group gap="sm" align="center">
                <Text className="text-6xl font-bold text-rose-600">
                  {currentQuestion.char.char}
                </Text>
                <Button
                  variant="subtle"
                  color="rose"
                  size="sm"
                  radius="xl"
                  onClick={() => speakChar(currentQuestion.char.char)}
                >
                  <IconPlay size={16} />
                </Button>
              </Group>
            ) : (
              <Group gap="sm" align="center">
                <Text className="text-5xl font-bold text-red-500">
                  {currentQuestion.char.pinyin}
                </Text>
                <Button
                  variant="subtle"
                  color="rose"
                  size="sm"
                  radius="xl"
                  onClick={() => speakChar(currentQuestion.char.char)}
                >
                  <IconPlay size={16} />
                </Button>
              </Group>
            )}

            {currentQuestion.char.word && (
              <Text size="sm" className="text-gray-400">
                组词：<span className="text-rose-500 font-medium">{currentQuestion.char.word}</span>
              </Text>
            )}
          </Stack>
        </Card>

        <SimpleGrid cols={2} spacing="sm" className="animate-slide-up stagger-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option === currentQuestion.answer
            const showResult = isAnswered

            let bgColor = 'bg-white hover:bg-gray-50'
            let borderColor = 'border-gray-200'
            let textColor = 'text-gray-700'

            if (showResult) {
              if (isCorrect) {
                bgColor = 'bg-emerald-50'
                borderColor = 'border-emerald-400'
                textColor = 'text-emerald-700'
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-red-50'
                borderColor = 'border-red-400'
                textColor = 'text-red-700'
              }
            } else if (isSelected) {
              bgColor = 'bg-rose-50'
              borderColor = 'border-rose-400'
            }

            const isPinyinOption = currentQuestion.type === 'charToPinyin'

            return (
              <Card
                key={idx}
                shadow="none"
                padding="lg"
                radius="xl"
                className={`cursor-pointer transition-all ${bgColor} border-2 ${borderColor} ${
                  !isAnswered ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
                }`}
                onClick={() => handleAnswer(option)}
              >
                <Text
                  ta="center"
                  fw={600}
                  size={isPinyinOption ? 'xl' : '3xl'}
                  className={textColor}
                >
                  {option}
                </Text>
              </Card>
            )
          })}
        </SimpleGrid>

        {isAnswered && (
          <Button
            size="lg"
            radius="xl"
            className="animate-slide-up bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold"
            onClick={handleNext}
            rightSection={<IconArrowRight size={18} />}
          >
            {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
          </Button>
        )}

        <Box className="h-4" />
      </Stack>
    )
  }

  if (stage === 'result') {
    return (
      <Stack gap="lg" className="px-1">
        <Card shadow="lg" padding="xl" radius="xl" className="bg-gradient-to-br from-rose-500 to-red-500 text-white animate-slide-up">
          <Stack align="center" gap="md">
            <Box className={`w-20 h-20 rounded-full flex items-center justify-center ${
              percentage >= 80 ? 'bg-yellow-400' : percentage >= 60 ? 'bg-white/30' : 'bg-white/20'
            } animate-bounce-in`}>
              {percentage >= 80 ? (
                <IconStar size={40} className="text-yellow-600" />
              ) : percentage >= 60 ? (
                <IconCheck size={40} />
              ) : (
                <IconRefresh size={40} />
              )}
            </Box>
            <Title order={2} className="text-white">
              {percentage >= 80 ? '太棒了！' : percentage >= 60 ? '不错哦！' : '继续加油！'}
            </Title>
            <Group gap="xl">
              <Stack align="center" gap={0}>
                <Text size="xl" fw={700}>{correctCount}</Text>
                <Text size="sm" className="text-white/80">正确</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xl" fw={700}>{questions.length - correctCount}</Text>
                <Text size="sm" className="text-white/80">错误</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xl" fw={700}>{percentage}%</Text>
                <Text size="sm" className="text-white/80">正确率</Text>
              </Stack>
            </Group>
          </Stack>
        </Card>

        <Group grow className="animate-slide-up stagger-1">
          <Button
            variant="light"
            size="lg"
            radius="xl"
            color="gray"
            className="text-gray-700"
            leftSection={<IconRefresh size={18} />}
            onClick={handleRestart}
          >
            重新选择
          </Button>
          <Button
            size="lg"
            radius="xl"
            className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold"
            leftSection={<IconArrowRight size={18} />}
            onClick={startPractice}
          >
            再练一次
          </Button>
        </Group>

        <Box className="h-4" />
      </Stack>
    )
  }

  return null
}
