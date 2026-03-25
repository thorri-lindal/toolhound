import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider } from './i18n/LanguageContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ToolDetail from './pages/ToolDetail'
import MindmapPage from './pages/MindmapPage'
import WizardPage from './pages/WizardPage'
import SuggestPage from './pages/SuggestPage'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/wizard" element={<WizardPage />} />
          <Route path="/suggest" element={<SuggestPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename="/">
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  )
}
