import { Router } from 'express'
import { LicenseType } from '@prisma/client'
import prisma from '../db'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { projectId, softwareName, softwareId, version, licenseType, endOfSupport, endOfLife, notes } = req.body
    const installation = await prisma.installation.create({
      data: {
        projectId: Number(projectId),
        softwareId: softwareId ? Number(softwareId) : null,
        softwareName,
        version,
        licenseType: licenseType as LicenseType,
        endOfSupport: endOfSupport ? new Date(endOfSupport) : null,
        endOfLife: endOfLife ? new Date(endOfLife) : null,
        notes: notes || null,
      },
    })
    res.status(201).json(installation)
  } catch {
    res.status(500).json({ error: 'Failed to create installation' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { softwareName, softwareId, version, licenseType, endOfSupport, endOfLife, notes } = req.body
    const installation = await prisma.installation.update({
      where: { id: Number(req.params.id) },
      data: {
        softwareId: softwareId ? Number(softwareId) : null,
        softwareName,
        version,
        licenseType: licenseType as LicenseType,
        endOfSupport: endOfSupport ? new Date(endOfSupport) : null,
        endOfLife: endOfLife ? new Date(endOfLife) : null,
        notes: notes || null,
      },
    })
    res.json(installation)
  } catch {
    res.status(500).json({ error: 'Failed to update installation' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.installation.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete installation' })
  }
})

export default router
