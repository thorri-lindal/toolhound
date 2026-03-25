import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'
import ToolCard from '../components/ToolCard'
import { TOOLS, CATEGORIES } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'

const CATEGORY_ORDER = ['hand_tool', 'power_tool', 'specialized', 'measuring', 'fastener', 'adhesive']

// Deterministic "tool of the day" based on date
function getToolOfDay() {
  const now = new Date()
  const dayIndex = (now.getFullYear() * 366 + now.getMonth() * 31 + now.getDate()) % TOOLS.length
  return TOOLS[dayIndex]
}

export default function Home() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({ action: null, material: null, materialB: null, method: null })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return TOOLS.filter((tool) => {
      if (filters.action && !tool.actions.includes(filters.action)) return false
      if (filters.material && !tool.materials.includes(filters.material)) return false
      if (filters.materialB && !tool.materials.includes(filters.materialB)) return false
      if (filters.method && !tool.methods.includes(filters.method)) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.subcategory.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filters, search])

  const hasFilters = filters.action || filters.material || filters.materialB || filters.method || search
  const counts = useMemo(() => {
    const c = {}
    CATEGORY_ORDER.forEach((k) => { c[k] = 0 })
    filtered.forEach((t) => { c[t.category] = (c[t.category] || 0) + 1 })
    return c
  }, [filtered])

  const toolOfDay = useMemo(() => getToolOfDay(), [])
  const todCat = CATEGORIES[toolOfDay.category]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      {!hasFilters && (
        <div className="text-center py-8">
          <img
            src={import.meta.env.BASE_URL + 'logo.png'}
            alt="ToolWiki logo"
            className="mx-auto mb-6 h-[30rem] w-auto"
          />
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            {t('home.title')}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('home.subtitle', { count: TOOLS.length })}
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <Link
              to="/browse"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
            >
              {t('home.browseAll')}
            </Link>
            <Link
              to="/mindmap"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {t('home.exploreMindmap')}
            </Link>
          </div>

          {/* Tool of the Day */}
          <div className="mt-10 max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
              <span className="text-lg">⭐</span> {t('home.toolOfDay')}
            </h3>
            <Link
              to={`/tool/${toolOfDay.id}`}
              className="block bg-white dark:bg-slate-800 rounded-2xl border-2 border-brand-200 dark:border-brand-700 p-5 shadow-sm hover:shadow-md hover:border-brand-400 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{toolOfDay.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`category-badge ${todCat.color}`}>{todCat.label}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{toolOfDay.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{toolOfDay.description}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <FilterPanel filters={filters} onChange={setFilters} />

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">{t('home.noMatch')}</p>
          <button
            onClick={() => { setFilters({ action: null, material: null, materialB: null, method: null }); setSearch('') }}
            className="mt-3 text-sm text-brand-500 hover:underline"
          >
            {t('home.clearAll')}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORY_ORDER.filter((k) => counts[k] > 0).map((catKey) => {
            const tools = filtered.filter((t) => t.category === catKey)
            const cat = CATEGORIES[catKey]
            return (
              <section key={catKey}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
                  <h2 className="font-semibold text-slate-700 dark:text-slate-200">{cat.label}</h2>
                  <span className="text-sm text-slate-400">({tools.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
