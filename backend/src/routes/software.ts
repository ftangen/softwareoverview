import { Router } from 'express'
import prisma from '../db'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    const software = await prisma.softwareCatalog.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { vendor: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { _count: { select: { installations: true } } },
      orderBy: { name: 'asc' },
    })
    res.json(software)
  } catch {
    res.status(500).json({ error: 'Failed to fetch software' })
  }
})

router.get('/:id/projects', async (req, res) => {
  try {
    const installations = await prisma.installation.findMany({
      where: { softwareId: Number(req.params.id) },
      include: { project: true },
      orderBy: { project: { projectNumber: 'asc' } },
    })
    res.json(installations)
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects for software' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, vendor, endOfSupport, endOfLife } = req.body
    const software = await prisma.softwareCatalog.create({
      data: {
        name,
        vendor: vendor || null,
        endOfSupport: endOfSupport ? new Date(endOfSupport) : null,
        endOfLife: endOfLife ? new Date(endOfLife) : null,
      },
    })
    res.status(201).json(software)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Programvaren finnes allerede i katalogen' })
    }
    res.status(500).json({ error: 'Failed to create software' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, vendor, endOfSupport, endOfLife } = req.body
    const software = await prisma.softwareCatalog.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        vendor: vendor || null,
        endOfSupport: endOfSupport ? new Date(endOfSupport) : null,
        endOfLife: endOfLife ? new Date(endOfLife) : null,
      },
    })
    res.json(software)
  } catch {
    res.status(500).json({ error: 'Failed to update software' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.softwareCatalog.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete software' })
  }
})

export default router
