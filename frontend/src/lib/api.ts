const BASE = '/api'

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getProjects: (search?: string) =>
    request(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProject: (id: number) => request(`/projects/${id}`),
  createProject: (data: object) =>
    request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: object) =>
    request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) => request(`/projects/${id}`, { method: 'DELETE' }),

  getSoftware: (search?: string) =>
    request(`/software${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getSoftwareProjects: (id: number) => request(`/software/${id}/projects`),
  createSoftware: (data: { name: string; vendor?: string; endOfSupport?: string; endOfLife?: string }) =>
    request('/software', { method: 'POST', body: JSON.stringify(data) }),
  updateSoftware: (id: number, data: object) =>
    request(`/software/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSoftware: (id: number) => request(`/software/${id}`, { method: 'DELETE' }),

  createInstallation: (data: object) =>
    request('/installations', { method: 'POST', body: JSON.stringify(data) }),
  updateInstallation: (id: number, data: object) =>
    request(`/installations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstallation: (id: number) => request(`/installations/${id}`, { method: 'DELETE' }),

  getAlerts: () => request('/dashboard/alerts'),
  getDashboardStats: () => request('/dashboard/stats'),
}
