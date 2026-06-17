import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '../lib/api'

interface Installation {
  id: number
  softwareName: string
  softwareId?: number | null
  version: string
  licenseType: string
  endOfSupport?: string | null
  endOfLife?: string | null
  notes?: string | null
}

interface Props {
  projectId: number
  installation?: Installation
  onClose: () => void
  onSave: () => void
}

export default function InstallationForm({ projectId, installation, onClose, onSave }: Props) {
  const [softwareName, setSoftwareName] = useState(installation?.softwareName || '')
  const [softwareId, setSoftwareId] = useState<number | null>(installation?.softwareId ?? null)
  const [version, setVersion] = useState(installation?.version || '')
  const [licenseType, setLicenseType] = useState(installation?.licenseType || 'COMMERCIAL')
  const [endOfSupport, setEndOfSupport] = useState(
    installation?.endOfSupport ? installation.endOfSupport.slice(0, 10) : '',
  )
  const [endOfLife, setEndOfLife] = useState(
    installation?.endOfLife ? installation.endOfLife.slice(0, 10) : '',
  )
  const [notes, setNotes] = useState(installation?.notes || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: suggestions } = useQuery({
    queryKey: ['software-suggest', softwareName],
    queryFn: () => api.getSoftware(softwareName),
    enabled: softwareName.length > 1 && !softwareId,
  })

  const save = useMutation({
    mutationFn: () => {
      const data = {
        softwareName,
        softwareId,
        version,
        licenseType,
        endOfSupport: endOfSupport || null,
        endOfLife: endOfLife || null,
        notes: notes || null,
      }
      return installation
        ? api.updateInstallation(installation.id, data)
        : api.createInstallation({ ...data, projectId })
    },
    onSuccess: onSave,
  })

  const isValid = softwareName.trim() && version.trim()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">
            {installation ? 'Rediger programvare' : 'Legg til programvare'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Programvarenavn *</label>
            <input
              type="text"
              value={softwareName}
              onChange={(e) => {
                setSoftwareName(e.target.value)
                setSoftwareId(null)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="F.eks. Windows Server 2022"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {showSuggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                {(suggestions as any[]).slice(0, 7).map((sw: any) => (
                  <button
                    key={sw.id}
                    onMouseDown={() => {
                      setSoftwareName(sw.name)
                      setSoftwareId(sw.id)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span>{sw.name}</span>
                    {sw.vendor && <span className="text-gray-500 text-xs">{sw.vendor}</span>}
                  </button>
                ))}
                <div className="px-3 py-1.5 text-xs text-gray-600 border-t border-gray-700">
                  Skriv fritt for å legge til ny programvare
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Versjon *</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="F.eks. 22H2"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lisens</label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="COMMERCIAL">Kommersiell</option>
                <option value="OPEN_SOURCE">Open Source</option>
                <option value="NONE">Ingen</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">End of Support</label>
              <input
                type="date"
                value={endOfSupport}
                onChange={(e) => setEndOfSupport(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End of Life</label>
              <input
                type="date"
                value={endOfLife}
                onChange={(e) => setEndOfLife(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notater</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Valgfrie notater..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
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
            {save.isPending ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </div>
  )
}
