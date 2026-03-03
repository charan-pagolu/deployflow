export interface Deployment {
  id: string
  repo_url: string
  status: 'pending' | 'building' | 'running' | 'failed'
  container_id: string | null
  port: number | null
  logs: string | null
  created_at: string
  updated_at: string
}

const BASE = '/api/v1'

export async function createDeployment(repo_url: string): Promise<Deployment> {
  const res = await fetch(`${BASE}/deployments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url }),
  })
  if (!res.ok) throw new Error('Failed to create deployment')
  return res.json()
}

export async function getDeployments(): Promise<Deployment[]> {
  const res = await fetch(`${BASE}/deployments`)
  if (!res.ok) throw new Error('Failed to fetch deployments')
  return res.json()
}

export function repoName(url: string): string {
  return url.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
}

export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
