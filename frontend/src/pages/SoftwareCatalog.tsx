import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Search, Plus, X, Package, ChevronRight, Pencil } from 'lucide-react'
import { api } from '../lib/api'
import { formatDate } from '../lib/utils'

interface CatalogForm {
  name: string
  vendor: string
  endOfSupport: string
  endOfLife: string
}

const emptyForm = (): CatalogForm => ({ name: '', vendor: '', endOfSupport: '', endOfLife: '' })

export default function SoftwareCatalog() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<CatalogForm>(emptyForm())
  const [formError, setFormError] = useState('')
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

  const saveSoftware = useMutation({
    mutationFn: () =>
      editing
        ? api.updateSoftware(editing.id, {
            name: form.name.trim(),
            vendor: form.vendor.trim(),
            endOfSupport: form.endOfSupport || null,
            endOfLife: form.endOfLife || null,
          })
        : api.createSoftware({
            name: form.name.trim(),
            vendor: form.vendor.trim(),
            endOfSupport: form.endOfSupport || undefined,
            endOfLife: form.endOfLife || undefined,
          }),
    onSuccess: (saved: any) => {
      qc.invalidateQueries({ queryKey: ['software'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      if (selected?.id === saved.id) setSelected(saved)
      closeModal()
    },
    onError: (err: Error) => setFormError(err.message),
  })

  function openAdd() {
    setForm(emptyForm())
    setFormError('')
    setEditing(null)
    setShowAdd(true)
  }

  function openEdit(sw: any) {
    setForm({
      name: sw.name,
      vendor: sw.vendor || '',
      endOfSupport: sw.endOfSupport ? sw.endOfSupport.slice(0, 10) : '',
      endOfLife: sw.endOfLife ? sw.endOfLife.slice(0, 10) : '',
    })
    setFormError('')
    setEditing(sw)
    setShowAdd(true)
  }

  function closeModal() {
    setShowAdd(false)
    setEditing(null)
    setForm(emptyForm())
    setFormError('')
  }

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
          onClick={openAdd}
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
                  <div
                    key={sw.id}
                    className={`flex items-center transition-colors border-l-2 ${
                      selected?.id === sw.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'border-transparent hover:bg-gray-800/50'
                    }`}
                  >
                    <button
                      onClick={() => setSelected(selected?.id === sw.id ? null : sw)}
                      className="flex-1 text-left px-4 py-3"
                    >
                      <p className="text-sm font-medium text-white">{sw.name}</p>
                      {sw.vendor && <p className="text-xs text-gray-500 mt-0.5">{sw.vendor}</p>}
                    </button>
                    <div className="flex items-center gap-3 px-4 shrink-0">
                      <span className="text-xs text-gray-500">{sw._count.installations} prosjekter</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(sw) }}
                        className="text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <ChevronRight size={13} className="text-gray-600" />
                    </div>
                  </div>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(selected)}
                    className="text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {(selected.endOfSupport || selected.endOfLife) && (
                <div className="px-4 py-3 border-b border-gray-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">End of Support</p>
                    <p className="text-sm text-gray-200">
                      {selected.endOfSupport ? formatDate(selected.endOfSupport) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">End of Life</p>
                    <p className="text-sm text-gray-200">
                      {selected.endOfLife ? formatDate(selected.endOfLife) : '—'}
                    </p>
                  </div>
                </div>
              )}

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
              <h3 className="font-semibold text-white">
                {editing ? 'Rediger programvare' : 'Legg til programvare i katalog'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Programvarenavn *</label>
                <input
                  type="text"
                  placeholder="F.eks. Windows Server 2022"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Leverandør</label>
                <input
                  type="text"
                  placeholder="F.eks. Microsoft"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End of Support</label>
                  <input
                    type="date"
                    value={form.endOfSupport}
                    onChange={(e) => setForm({ ...form, endOfSupport: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End of Life</label>
                  <input
                    type="date"
                    value={form.endOfLife}
                    onChange={(e) => setForm({ ...form, endOfLife: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Avbryt
              </button>
              <button
                onClick={() => saveSoftware.mutate()}
                disabled={!form.name.trim() || saveSoftware.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
              >
                {saveSoftware.isPending ? 'Lagrer...' : editing ? 'Lagre' : 'Legg til'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
