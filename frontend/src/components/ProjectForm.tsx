import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '../lib/api'

interface Props {
  project?: { id: number; projectNumber: string; projectName: string; customer?: string | null; notes?: string | null }
  onClose: () => void
  onSave: () => void
}

export default function ProjectForm({ project, onClose, onSave }: Props) {
  const [projectNumber, setProjectNumber] = useState(project?.projectNumber || '')
  const [projectName, setProjectName] = useState(project?.projectName || '')
  const [customer, setCustomer] = useState(project?.customer || '')
  const [notes, setNotes] = useState(project?.notes || '')
  const [error, setError] = useState('')

  const save = useMutation({
    mutationFn: () =>
      project
        ? api.updateProject(project.id, { projectNumber, projectName, customer, notes })
        : api.createProject({ projectNumber, projectName, customer, notes }),
    onSuccess: onSave,
    onError: (err: Error) => setError(err.message),
  })

  const isValid = projectNumber.trim() && projectName.trim()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">{project ? 'Rediger prosjekt' : 'Nytt prosjekt'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prosjektnummer *</label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="F.eks. P-1234"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prosjektnavn *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Navn på prosjektet"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kunde</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Kundenavn"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notater</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Valgfrie notater..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={!isValid || save.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
          >
            {save.isPending ? 'Lagrer...' : project ? 'Lagre' : 'Opprett prosjekt'}
          </button>
        </div>
      </div>
    </div>
  )
}
