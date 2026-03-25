import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/tools'

export default function ToolCard({ tool }) {
  const cat = CATEGORIES[tool.category]

  return (
    <Link to={`/tool/${tool.id}`} className="tool-card flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="text-3xl">{tool.emoji}</div>
        <span className={`category-badge ${cat.color}`}>{cat.label}</span>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors leading-tight">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{tool.subcategory}</p>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">{tool.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {tool.actions.slice(0, 3).map((a) => (
          <span key={a} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs">
            {a}
          </span>
        ))}
        {tool.actions.length > 3 && (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full text-xs">
            +{tool.actions.length - 3}
          </span>
        )}
      </div>
    </Link>
  )
}
