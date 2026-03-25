import { useState } from 'react'
import { ACTIONS, MATERIALS, METHODS, JOINING_ACTIONS } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'

const Selector = ({ label, emoji, options, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.id === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all min-w-[160px] ${
          value
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
        }`}
      >
        <span className="text-lg">{selected ? selected.emoji || emoji : emoji}</span>
        <span className="flex-1 text-left">{selected ? selected.label : label}</span>
        <svg
          className={`w-4 h-4 transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto">
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {label}
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-brand-50 dark:hover:bg-brand-900/30 ${
                  value === opt.id ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 font-medium' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.emoji && <span>{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function FilterPanel({ filters, onChange }) {
  const { t } = useTranslation()
  const { action, material, materialB, method } = filters
  const isJoining = JOINING_ACTIONS.has(action)

  const update = (key) => (val) => {
    const next = { ...filters, [key]: val }
    if (key === 'action' && !JOINING_ACTIONS.has(val)) {
      next.materialB = null
    }
    onChange(next)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium uppercase tracking-wide">{t('filter.iWantTo')}…</p>
      <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white text-lg">{t('filter.iWantTo')}</span>
        <Selector
          label={t('filter.anyAction')}
          emoji="⚡"
          options={ACTIONS}
          value={action}
          onChange={update('action')}
        />
        <span className="font-semibold text-slate-900 dark:text-white text-lg">{t('filter.some')}</span>
        <Selector
          label={t('filter.anyMaterial')}
          emoji="🪵"
          options={MATERIALS}
          value={material}
          onChange={update('material')}
        />
        {isJoining && (
          <>
            <span className="font-semibold text-slate-900 dark:text-white text-lg">{t('filter.to')}</span>
            <Selector
              label={t('filter.anyMaterial')}
              emoji="🪵"
              options={MATERIALS}
              value={materialB}
              onChange={update('materialB')}
            />
          </>
        )}
        <span className="font-semibold text-slate-900 dark:text-white text-lg">{t('filter.using')}</span>
        <Selector
          label={t('filter.anyMethod')}
          emoji="🔋"
          options={METHODS}
          value={method}
          onChange={update('method')}
        />
      </div>

      {(action || material || materialB || method) && (
        <button
          onClick={() => onChange({ action: null, material: null, materialB: null, method: null })}
          className="mt-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('filter.clearFilters')}
        </button>
      )}
    </div>
  )
}
