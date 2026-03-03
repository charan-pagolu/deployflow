import { Zap, Github } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Zap size={14} className="text-violet-400" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">DeployFlow</span>
          <span className="text-slate-600 text-sm hidden sm:block">— deploy anything, instantly</span>
        </div>
        <a
          href="https://github.com/charan-pagolu/deployflow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Github size={14} />
          <span className="hidden sm:block">charan-pagolu/deployflow</span>
        </a>
      </div>
    </nav>
  )
}
