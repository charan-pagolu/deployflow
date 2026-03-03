import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import DeployForm from './components/DeployForm'
import DeploymentCard from './components/DeploymentCard'
import { getDeployments, type Deployment } from './api/deployments'

const ACTIVE = ['pending', 'building']

export default function App() {
  const { data: deployments, isLoading, error } = useQuery<Deployment[]>({
    queryKey: ['deployments'],
    queryFn: getDeployments,
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.some((d) => ACTIVE.includes(d.status)) ? 3000 : 10000
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <DeployForm />

        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Deployments
            </h2>
            {deployments && (
              <span className="ml-auto text-xs text-slate-600">
                {deployments.length} total
              </span>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20 text-slate-600">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading deployments...</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
              Failed to load deployments. Is the API running?
            </div>
          )}

          {deployments && deployments.length === 0 && (
            <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
              <p className="text-slate-600 text-sm">No deployments yet.</p>
              <p className="text-slate-700 text-xs mt-1">Paste a GitHub repo URL above to get started.</p>
            </div>
          )}

          {deployments && deployments.length > 0 && (
            <div className="space-y-3">
              {deployments.map((d) => (
                <DeploymentCard key={d.id} deployment={d} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
