import { Router } from 'express'
import prisma from '../db'

const router = Router()

router.get('/alerts', async (req, res) => {
  try {
    const now = new Date()
    const in180Days = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const installations = await prisma.installation.findMany({
      where: {
        OR: [
          { endOfLife: { lte: in180Days } },
          { endOfSupport: { lte: in180Days } },
        ],
      },
      include: { project: true },
      orderBy: [{ endOfLife: 'asc' }, { endOfSupport: 'asc' }],
    })

    const withStatus = installations.map((inst) => {
      const dates = [inst.endOfSupport, inst.endOfLife]
        .filter(Boolean)
        .map((d) => new Date(d!))
      const earliest = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null

      let alertStatus: 'expired' | 'critical' | 'warning' = 'warning'
      if (earliest && earliest < now) alertStatus = 'expired'
      else if (earliest && earliest < in90Days) alertStatus = 'critical'

      return { ...inst, alertStatus, alertDate: earliest }
    })

    res.json(withStatus)
  } catch {
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const [projectCount, softwareCount, installationCount, expiredCount, criticalCount] =
      await Promise.all([
        prisma.project.count(),
        prisma.softwareCatalog.count(),
        prisma.installation.count(),
        prisma.installation.count({
          where: {
            OR: [{ endOfLife: { lt: now } }, { endOfSupport: { lt: now } }],
          },
        }),
        prisma.installation.count({
          where: {
            AND: [
              {
                OR: [
                  { endOfLife: { gte: now, lte: in90Days } },
                  { endOfSupport: { gte: now, lte: in90Days } },
                ],
              },
            ],
          },
        }),
      ])

    res.json({ projectCount, softwareCount, installationCount, expiredCount, criticalCount })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
