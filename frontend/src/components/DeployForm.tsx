import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Rocket, Github } from 'lucide-react'
import { createDeployment } from '../api/deployments'

export default function DeployForm() {
  const [url, setUrl] = useState('')
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: createDeployment,
    onSuccess: () => {
      setUrl('')
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (trimmed) mutate(trimmed)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Rocket size={18} className="text-violet-400" />
        <h2 className="text-sm font-semibold text-slate-200">Deploy a Repository</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors shrink-0"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Rocket size={14} />
          )}
          Deploy
        </button>
      </form>

      {error && (
        <p className="mt-3 text-xs text-red-400">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
      )}
    </div>
  )
}
