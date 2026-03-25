import { useState } from 'react'
import ToolCard from '../components/ToolCard'
import { TOOLS, CATEGORIES } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'

const CATEGORY_ORDER = ['hand_tool', 'power_tool', 'specialized', 'measuring', 'fastener', 'adhesive']

export default function Browse() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const display = activeCategory ? TOOLS.filter((t) => t.category === activeCategory) : TOOLS

  const grouped = display.reduce((acc, tool) => {
    const key = `${CATEGORIES[tool.category]?.label} › ${tool.subcategory}`
    if (!acc[key]) acc[key] = []
    acc[key].push(tool)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('browse.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('browse.subtitle', { count: TOOLS.length, categories: Object.keys(CATEGORIES).length })}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            title={t('browse.gridView')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            title={t('browse.listView')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`chip ${activeCategory === null ? 'chip-active' : 'chip-inactive'}`}
        >
          {t('browse.all')} ({TOOLS.length})
        </button>
        {CATEGORY_ORDER.map((k) => {
          const cat = CATEGORIES[k]
          const count = TOOLS.filter((t) => t.category === k).length
          return (
            <button
              key={k}
              onClick={() => setActiveCategory(k === activeCategory ? null : k)}
              className={`chip ${activeCategory === k ? 'chip-active' : 'chip-inactive'}`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {Object.entries(grouped).map(([group, tools]) => (
        <section key={group}>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{group}</h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool) => {
                const cat = CATEGORIES[tool.category]
                return (
                  <a
                    key={tool.id}
                    href={`/skurinn/tool/${tool.id}`}
                    className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all"
                  >
                    <span className="text-2xl flex-shrink-0">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{tool.name}</span>
                        <span className={`category-badge text-[10px] ${cat.color}`}>{cat.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 flex-shrink-0 max-w-[200px]">
                      {tool.actions.slice(0, 3).map((a) => (
                        <span key={a} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-[10px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
