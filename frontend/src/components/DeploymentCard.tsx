import { GitBranch, Container, Clock, ExternalLink, Terminal } from 'lucide-react'
import type { Deployment } from '../api/deployments'
import { repoName, timeAgo } from '../api/deployments'
import StatusBadge from './StatusBadge'

export default function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const { repo_url, status, port, logs, container_id, created_at } = deployment
  const isBuilding = status === 'pending' || status === 'building'

  return (
    <div className={`
      relative rounded-xl border bg-card p-5 transition-all duration-200
      hover:bg-card-hover hover:border-violet-500/30
      ${isBuilding ? 'border-amber-500/30' : 'border-border'}
    `}>
      {isBuilding && (
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse-slow" />
      )}
      {status === 'running' && (
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch size={15} className="text-slate-500 shrink-0" />
          <span className="font-mono text-sm text-slate-200 truncate">{repoName(repo_url)}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
        {container_id && (
          <span className="flex items-center gap-1.5">
            <Container size={12} />
            <span className="font-mono">{container_id.slice(0, 12)}</span>
          </span>
        )}
        {port && status === 'running' && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ExternalLink size={12} />
            <span className="font-mono">:{port}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto">
          <Clock size={12} />
          {timeAgo(created_at)}
        </span>
      </div>

      {logs && status === 'failed' && (
        <div className="mt-4 rounded-lg bg-red-500/5 border border-red-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Terminal size={12} className="text-red-400" />
            <span className="text-xs text-red-400 font-medium">Error</span>
          </div>
          <pre className="font-mono text-xs text-red-300/80 whitespace-pre-wrap break-all line-clamp-4">
            {logs}
          </pre>
        </div>
      )}
    </div>
  )
}
