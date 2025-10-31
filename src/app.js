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
import { ReportRouter } from './routes/report.route.js'

app.use('/CivicPlus/v1/users', router) // {router} me sb hai  , jb bhi api hit krege to hme URl Me {/CivicPlus/v1/users} me itna likhne ki need nhi hogi only createReport Likh do Ho jayega  KAM. app hi postmen me real me, last me chlata run hota hai .
app.use('/CivicPlus/v1/report', ReportRouter) //  ye line ka mtlb hota hota hai :-civik/v1/report me  {ReportRouter} ko add kr do or {ReportRouter} me createReport or verify,multer hai

export { app }
