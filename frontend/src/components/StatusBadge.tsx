import type { Deployment } from '../api/deployments'

const config = {
  pending:  { dot: 'bg-slate-400',  text: 'text-slate-400',  bg: 'bg-slate-400/10',  label: 'Pending'  },
  building: { dot: 'bg-amber-400',  text: 'text-amber-400',  bg: 'bg-amber-400/10',  label: 'Building' },
  running:  { dot: 'bg-emerald-400',text: 'text-emerald-400',bg: 'bg-emerald-400/10',label: 'Running'  },
  failed:   { dot: 'bg-red-400',    text: 'text-red-400',    bg: 'bg-red-400/10',    label: 'Failed'   },
}

export default function StatusBadge({ status }: { status: Deployment['status'] }) {
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'building' ? 'animate-pulse-slow' : ''}`} />
      {c.label}
    </span>
  )
}
