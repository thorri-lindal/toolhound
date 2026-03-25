import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('toolwiki-lang') || 'en')

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'is' : 'en'
      localStorage.setItem('toolwiki-lang', next)
      return next
    })
  }, [])

  const t = useCallback(
    (key, replacements = {}) => {
      let str = translations[lang]?.[key] || translations.en[key] || key
      Object.entries(replacements).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
      return str
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
  return ctx
}
