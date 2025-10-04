import express, { json, urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true
  })
)

app.use(cookieParser())
///
app.use(urlencoded({ credentials: true, limit: '16kb' }))
app.use(json({ limit: '16kb' }))
app.use(express.static('public'))

import { router } from './routes/user.route.js'

app.use('/CivicPlus/v1/users', router) // {router} me sb hai

export { app }
