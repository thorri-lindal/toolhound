import { Link, useLocation } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'
import { useTranslation } from '../i18n/LanguageContext'

export default function Navbar() {
  const location = useLocation()
  const { lang, toggleLang, t } = useTranslation()

  const navLink = (to, labelKey) => {
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
    return (
      <Link
        to={to}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          active
            ? 'bg-brand-500 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
        }`}
      >
        {t(labelKey)}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
      <div className="px-0 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white -ml-6">
          <img
            src={import.meta.env.BASE_URL + 'logo.png'}
            alt="ToolWiki"
            className="h-[9rem] w-auto"
          />
        </Link>
        <nav className="flex items-center gap-1">
          {navLink('/', 'nav.findTool')}
          {navLink('/browse', 'nav.browse')}
          {navLink('/mindmap', 'nav.mindmap')}
          {navLink('/wizard', 'nav.wizard')}
          {navLink('/suggest', 'nav.suggest')}
          <div className="ml-2 flex items-center gap-1">
            <DarkModeToggle />
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold transition-colors text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 uppercase"
              title={lang === 'en' ? 'Switch to Icelandic' : 'Skipta yfir í ensku'}
            >
              {lang === 'en' ? '🇮🇸 IS' : '🇬🇧 EN'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
