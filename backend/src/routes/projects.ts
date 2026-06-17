import { Router } from 'express'
import prisma from '../db'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    const projects = await prisma.project.findMany({
      where: search
        ? {
            OR: [
              { projectName: { contains: String(search), mode: 'insensitive' } },
              { projectNumber: { contains: String(search), mode: 'insensitive' } },
              { customer: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { _count: { select: { installations: true } } },
      orderBy: { projectNumber: 'asc' },
    })
    res.json(projects)
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { installations: { orderBy: { softwareName: 'asc' } } },
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch {
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { projectNumber, projectName, customer, notes } = req.body
    const project = await prisma.project.create({
      data: { projectNumber, projectName, customer, notes },
    })
    res.status(201).json(project)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Prosjektnummer er allerede i bruk' })
    }
    res.status(500).json({ error: 'Failed to create project' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { projectNumber, projectName, customer, notes } = req.body
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { projectNumber, projectName, customer, notes },
    })
    res.json(project)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Prosjektnummer er allerede i bruk' })
    }
    res.status(500).json({ error: 'Failed to update project' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
