import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, ChevronRight, FolderKanban } from 'lucide-react'
import { api } from '../lib/api'
import ProjectForm from '../components/ProjectForm'

export default function Projects() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.getProjects(search),
  })

  const list = (projects as any[]) || []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban size={22} className="text-gray-400" />
          <h2 className="text-xl font-bold text-white">Prosjekter</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          Nytt prosjekt
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Søk på prosjektnummer, navn eller kunde..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <p className="px-6 py-10 text-gray-500 text-center text-sm">Laster...</p>
        ) : list.length === 0 ? (
          <p className="px-6 py-10 text-gray-500 text-center text-sm">
            {search ? 'Ingen prosjekter matcher søket' : 'Ingen prosjekter registrert ennå'}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prosjektnr.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prosjektnavn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programvare
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {list.map((project: any) => (
                <tr key={project.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-blue-400">{project.projectNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-white text-sm font-medium">{project.projectName}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{project.customer || '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{project._count.installations}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-gray-600 hover:text-blue-400 transition-colors inline-flex items-center"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            qc.invalidateQueries({ queryKey: ['projects'] })
            qc.invalidateQueries({ queryKey: ['stats'] })
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
