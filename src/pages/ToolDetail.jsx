import { useParams, Link } from 'react-router-dom'
import { TOOLS, CATEGORIES, ACTIONS, MATERIALS, METHODS } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'
import ToolCard from '../components/ToolCard'

const labelFor = (list, id) => list.find((x) => x.id === id)?.label || id

export default function ToolDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const tool = TOOLS.find((t) => t.id === id)

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('detail.notFound')}</h1>
        <Link to="/" className="text-brand-500 hover:underline">{t('detail.backToSearch')}</Link>
      </div>
    )
  }

  const cat = CATEGORIES[tool.category]
  const related = tool.relatedTools
    .map((rid) => TOOLS.find((t) => t.id === rid))
    .filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-brand-500">{t('detail.home')}</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-brand-500">{t('detail.browse')}</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">{tool.name}</span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start gap-5">
            <div className="text-6xl">{tool.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`category-badge ${cat.color}`}>{cat.label}</span>
                <span className="text-sm text-slate-400">{tool.subcategory}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{tool.name}</h1>
            </div>
          </div>
          <p className="mt-5 text-slate-600 dark:text-slate-300 text-base leading-relaxed">{tool.description}</p>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-8">
          {/* Actions */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{t('detail.actions')}</h2>
            <div className="flex flex-wrap gap-2">
              {tool.actions.map((a) => (
                <Link
                  key={a}
                  to={`/?action=${a}`}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {labelFor(ACTIONS, a)}
                </Link>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{t('detail.materials')}</h2>
            <div className="flex flex-wrap gap-2">
              {tool.materials.map((m) => (
                <Link
                  key={m}
                  to={`/?material=${m}`}
                  className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  {labelFor(MATERIALS, m)}
                </Link>
              ))}
            </div>
          </div>

          {/* Power method */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{t('detail.powerSource')}</h2>
            <div className="flex flex-wrap gap-2">
              {tool.methods.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                >
                  {labelFor(METHODS, m)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        {tool.tips.length > 0 && (
          <div className="px-8 pb-8">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span> {t('detail.proTips')}
            </h2>
            <ul className="space-y-2">
              {tool.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-brand-400 font-bold mt-0.5">›</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety notes */}
        {tool.safetyNotes.length > 0 && (
          <div className="mx-8 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <span>⚠️</span> {t('detail.safetyNotes')}
            </h2>
            <ul className="space-y-1.5">
              {tool.safetyNotes.map((note, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400 flex gap-2">
                  <span>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{t('detail.relatedTools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
