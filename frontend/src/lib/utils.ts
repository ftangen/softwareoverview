import { format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd.MM.yyyy', { locale: nb })
}

export type AlertStatus = 'ok' | 'warning' | 'critical' | 'expired'

export function getInstallationStatus(inst: {
  endOfSupport?: string | null
  endOfLife?: string | null
}): AlertStatus {
  const now = new Date()
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const in180 = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)

  const dates = [inst.endOfSupport, inst.endOfLife]
    .filter(Boolean)
    .map((d) => new Date(d!))

  if (!dates.length) return 'ok'

  const earliest = dates.reduce((a, b) => (a < b ? a : b))

  if (earliest < now) return 'expired'
  if (earliest < in90) return 'critical'
  if (earliest < in180) return 'warning'
  return 'ok'
}
