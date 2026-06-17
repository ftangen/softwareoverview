import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Search, Plus, X, Package, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'

export default function SoftwareCatalog() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newVendor, setNewVendor] = useState('')
  const [addError, setAddError] = useState('')
  const qc = useQueryClient()

  const { data: software } = useQuery({
    queryKey: ['software', search],
    queryFn: () => api.getSoftware(search),
  })

  const { data: usedIn } = useQuery({
    queryKey: ['software-projects', selected?.id],
    queryFn: () => api.getSoftwareProjects(selected.id),
    enabled: !!selected,
  })

  const addSoftware = useMutation({
    mutationFn: () => api.createSoftware(newName.trim(), newVendor.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['software'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setShowAdd(false)
      setNewName('')
      setNewVendor('')
      setAddError('')
    },
    onError: (err: Error) => setAddError(err.message),
  })

  const list = (software as any[]) || []
  const projects = (usedIn as any[]) || []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-gray-400" />
          <h2 className="text-xl font-bold text-white">Programvarekatalog</h2>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          Legg til programvare
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Søk i katalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {list.length === 0 ? (
              <p className="px-5 py-10 text-gray-500 text-center text-sm">
                {search ? 'Ingen treff' : 'Ingen programvare i katalogen ennå'}
              </p>
            ) : (
              <div className="divide-y divide-gray-800">
                {list.map((sw: any) => (
                  <button
                    key={sw.id}
                    onClick={() => setSelected(selected?.id === sw.id ? null : sw)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                      selected?.id === sw.id
                        ? 'bg-blue-600/20 border-l-2 border-blue-500'
                        : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{sw.name}</p>
                      {sw.vendor && <p className="text-xs text-gray-500 mt-0.5">{sw.vendor}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500">{sw._count.installations} prosjekter</span>
                      <ChevronRight size={13} className="text-gray-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {selected ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{selected.name}</p>
                  {selected.vendor && (
                    <p className="text-xs text-gray-500 mt-0.5">{selected.vendor}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="px-5 py-8 text-gray-500 text-center text-sm">
                  Ingen prosjekter bruker denne programvaren
                </p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {projects.map((inst: any) => (
                    <Link
                      key={inst.id}
                      to={`/projects/${inst.project.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{inst.project.projectName}</p>
                        <p className="text-xs text-blue-400 font-mono mt-0.5">
                          {inst.project.projectNumber}
                          {inst.project.customer && ` — ${inst.project.customer}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">v{inst.version}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center h-48">
              <p className="text-gray-600 text-sm">Velg en programvare for å se prosjekter</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Legg til programvare i katalog</h3>
              <button
                onClick={() => { setShowAdd(false); setAddError('') }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Programvarenavn *</label>
                <input
                  type="text"
                  placeholder="F.eks. Windows Server 2022"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Leverandør</label>
                <input
                  type="text"
                  placeholder="F.eks. Microsoft"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {addError && <p className="text-red-400 text-xs">{addError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAdd(false); setAddError('') }}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Avbryt
              </button>
              <button
                onClick={() => addSoftware.mutate()}
                disabled={!newName.trim() || addSoftware.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
              >
                {addSoftware.isPending ? 'Lagrer...' : 'Legg til'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
