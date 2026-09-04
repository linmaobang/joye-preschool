import { useCallback, useRef, useState } from 'react'
import { useApp } from '../stores/AppContext'
import { comboXpBonus, comboCoinBonus } from '../utils/gamification'

export interface AnswerGain {
  xp: number
  coins: number
}

export function useGamification() {
  const { onAnswerGamification } = useApp()
  const comboRef = useRef(0)
  const [combo, setCombo] = useState(0)
  const [lastGain, setLastGain] = useState<AnswerGain | null>(null)

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!isCorrect) {
      comboRef.current = 0
      setCombo(0)
      setLastGain(null)
      return
    }
    const next = comboRef.current + 1
    comboRef.current = next
    setCombo(next)
    setLastGain({ xp: 10 + comboXpBonus(next), coins: 1 + comboCoinBonus(next) })
    onAnswerGamification(true, next)
  }, [onAnswerGamification])

  const resetCombo = useCallback(() => {
    comboRef.current = 0
    setCombo(0)
    setLastGain(null)
  }, [])

  return { combo, lastGain, handleAnswer, resetCombo }
}
