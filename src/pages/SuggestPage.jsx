import { useState } from 'react'
import { CATEGORIES } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'

const CATEGORY_ORDER = ['hand_tool', 'power_tool', 'specialized', 'measuring', 'fastener', 'adhesive']

export default function SuggestPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', category: '', description: '' })
  const [submitted, setSubmitted] = useState(false)
  const [suggestions, setSuggestions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('toolwiki-suggestions') || '[]') }
    catch { return [] }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const entry = { ...form, id: Date.now(), date: new Date().toISOString() }
    const updated = [entry, ...suggestions]
    setSuggestions(updated)
    localStorage.setItem('toolwiki-suggestions', JSON.stringify(updated))
    setSubmitted(true)
  }

  const clearAll = () => {
    setSuggestions([])
    localStorage.removeItem('toolwiki-suggestions')
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('suggest.success')}</h1>
        <button
          onClick={() => { setForm({ name: '', category: '', description: '' }); setSubmitted(false) }}
          className="mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          {t('suggest.another')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('suggest.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('suggest.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('suggest.name')}</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('suggest.namePlaceholder')}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('suggest.category')}</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          >
            <option value="">{t('suggest.selectCategory')}</option>
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>{CATEGORIES[k].label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('suggest.description')}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('suggest.descriptionPlaceholder')}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full px-5 py-3 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          {t('suggest.submit')}
        </button>
      </form>

      {/* Previous suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('suggest.previousTitle')}</h2>
            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
              {t('suggest.clear')}
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">{s.name}</span>
                  {s.category && (
                    <span className={`category-badge ${CATEGORIES[s.category]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {CATEGORIES[s.category]?.label || s.category}
                    </span>
                  )}
                </div>
                {s.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
