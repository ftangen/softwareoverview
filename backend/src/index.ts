import express from 'express'
import cors from 'cors'
import projectsRouter from './routes/projects'
import softwareRouter from './routes/software'
import installationsRouter from './routes/installations'
import dashboardRouter from './routes/dashboard'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/projects', projectsRouter)
app.use('/api/software', softwareRouter)
app.use('/api/installations', installationsRouter)
app.use('/api/dashboard', dashboardRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
