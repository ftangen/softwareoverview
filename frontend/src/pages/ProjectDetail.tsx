import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { formatDate, getInstallationStatus } from '../lib/utils'
import StatusBadge from '../components/StatusBadge'
import InstallationForm from '../components/InstallationForm'
import ProjectForm from '../components/ProjectForm'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showInstForm, setShowInstForm] = useState(false)
  const [editingInst, setEditingInst] = useState<any>(null)
  const [editingProject, setEditingProject] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(Number(id)),
  })

  const deleteInst = useMutation({
    mutationFn: (instId: number) => api.deleteInstallation(instId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const p = project as any

  if (isLoading) return <div className="p-8 text-gray-500 text-sm">Laster...</div>
  if (!p) return <div className="p-8 text-red-400 text-sm">Prosjekt ikke funnet</div>

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', id] })
    qc.invalidateQueries({ queryKey: ['alerts'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
  }

  return (
    <div className="p-8">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Tilbake til prosjekter
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-blue-400">{p.projectNumber}</span>
            <button
              onClick={() => setEditingProject(true)}
              className="text-gray-600 hover:text-gray-300 transition-colors"
            >
              <Pencil size={13} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-white">{p.projectName}</h2>
          {p.customer && <p className="text-gray-400 text-sm mt-1">{p.customer}</p>}
          {p.notes && <p className="text-gray-600 text-sm mt-1">{p.notes}</p>}
        </div>
        <button
          onClick={() => setShowInstForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          Legg til programvare
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white text-sm">
            Installert programvare ({p.installations?.length || 0})
          </h3>
        </div>

        {!p.installations?.length ? (
          <p className="px-6 py-10 text-gray-500 text-center text-sm">
            Ingen programvare registrert ennå
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programvare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versjon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lisens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End of Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End of Life
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {p.installations.map((inst: any) => {
                const status = getInstallationStatus(inst)
                return (
                  <tr key={inst.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-medium">{inst.softwareName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">{inst.version}</td>
                    <td className="px-6 py-4">
                      <LicenseBadge type={inst.licenseType} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {inst.endOfSupport ? formatDate(inst.endOfSupport) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {inst.endOfLife ? formatDate(inst.endOfLife) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => setEditingInst(inst)}
                          className="text-gray-600 hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Slett ${inst.softwareName}?`)) deleteInst.mutate(inst.id)
                          }}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {(showInstForm || editingInst) && (
        <InstallationForm
          projectId={Number(id)}
          installation={editingInst}
          onClose={() => {
            setShowInstForm(false)
            setEditingInst(null)
          }}
          onSave={() => {
            invalidate()
            setShowInstForm(false)
            setEditingInst(null)
          }}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={p}
          onClose={() => setEditingProject(false)}
          onSave={() => {
            qc.invalidateQueries({ queryKey: ['project', id] })
            qc.invalidateQueries({ queryKey: ['projects'] })
            setEditingProject(false)
          }}
        />
      )}
    </div>
  )
}

function LicenseBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMMERCIAL: {
      label: 'Kommersiell',
      className: 'bg-blue-900/40 text-blue-300 border border-blue-800/50',
    },
    OPEN_SOURCE: {
      label: 'Open Source',
      className: 'bg-green-900/40 text-green-300 border border-green-800/50',
    },
    NONE: {
      label: 'Ingen',
      className: 'bg-gray-800 text-gray-400 border border-gray-700',
    },
  }
  const { label, className } = map[type] || map.NONE
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${className}`}>{label}</span>
  )
}
