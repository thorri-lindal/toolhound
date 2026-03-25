import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOLS, ACTIONS, MATERIALS, METHODS, CATEGORIES } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'
import ToolCard from '../components/ToolCard'

const STEPS = ['action', 'material', 'method']

export default function WizardPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ action: null, material: null, method: null })
  const [direction, setDirection] = useState(1)

  const stepOptions = {
    action: ACTIONS,
    material: MATERIALS,
    method: METHODS,
  }

  const stepTitles = {
    action: t('wizard.step1'),
    material: t('wizard.step2'),
    method: t('wizard.step3'),
  }

  const stepEmojis = { action: '⚡', material: '🪵', method: '🔋' }

  const results = useMemo(() => {
    if (step < 3) return []
    return TOOLS.map((tool) => {
      let score = 0
      if (answers.action && tool.actions.includes(answers.action)) score += 2
      if (answers.material && tool.materials.includes(answers.material)) score += 2
      if (answers.method && tool.methods.includes(answers.method)) score += 1
      return { tool, score }
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [step, answers])

  const maxScore = (answers.action ? 2 : 0) + (answers.material ? 2 : 0) + (answers.method ? 1 : 0)
  const perfect = results.filter((r) => r.score === maxScore)
  const partial = results.filter((r) => r.score < maxScore)

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const select = (key, val) => {
    setAnswers((a) => ({ ...a, [key]: val }))
  }

  const startOver = () => {
    setDirection(-1)
    setAnswers({ action: null, material: null, method: null })
    setStep(0)
  }

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('wizard.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('wizard.subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step
                  ? 'bg-brand-500 text-white'
                  : i === step
                  ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
            >
              {i < step ? '✓' : i === 3 ? '🎯' : i + 1}
            </div>
            {i < 3 && (
              <div className={`w-12 h-1 rounded-full ${i < step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step < 3 ? (
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8"
            >
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">{stepEmojis[STEPS[step]]}</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stepTitles[STEPS[step]]}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {t('wizard.step')} {step + 1} {t('wizard.of')} 3
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                {stepOptions[STEPS[step]].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => select(STEPS[step], opt.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      answers[STEPS[step]] === opt.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-400'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={goBack}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {t('wizard.back')}
                  </button>
                )}
                <button
                  onClick={goNext}
                  className="px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  {answers[STEPS[step]] ? t('wizard.next') : t('wizard.skip')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('wizard.results')}</h2>
                <button
                  onClick={startOver}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('wizard.startOver')}
                </button>
              </div>

              {/* Summary of choices */}
              <div className="flex flex-wrap gap-2 mb-6">
                {answers.action && (
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    ⚡ {ACTIONS.find((a) => a.id === answers.action)?.label}
                  </span>
                )}
                {answers.material && (
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                    🪵 {MATERIALS.find((m) => m.id === answers.material)?.label}
                  </span>
                )}
                {answers.method && (
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    🔋 {METHODS.find((m) => m.id === answers.method)?.label}
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p>{t('wizard.noResults')}</p>
                  <button onClick={startOver} className="mt-3 text-sm text-brand-500 hover:underline">
                    {t('wizard.startOver')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {perfect.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>🎯</span> {t('wizard.perfectMatch')} ({perfect.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {perfect.map(({ tool }) => (
                          <ToolCard key={tool.id} tool={tool} />
                        ))}
                      </div>
                    </div>
                  )}
                  {partial.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        {t('wizard.partialMatch')} ({partial.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partial.slice(0, 12).map(({ tool }) => (
                          <ToolCard key={tool.id} tool={tool} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
