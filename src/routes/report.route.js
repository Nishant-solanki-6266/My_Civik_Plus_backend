import { Router } from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'
import {
  createReport,
  deleteReport,
  getAllReports,
  updateReportStatus
} from '../controllers/report.controller.js'
import { verifyAdmin } from '../middleware/admin.middleware.js'

const ReportRouter = Router()

ReportRouter.route('/createReport').post(
  verifyJwt,
  upload.single('ReportImg'),
  createReport
)
ReportRouter.route('/All-Reports').get(verifyJwt, verifyAdmin, getAllReports)
ReportRouter.route('/reportstatus/:id/status').put(
  verifyJwt,
  verifyAdmin,
  updateReportStatus
)
ReportRouter.route('/delete-report/:id').post(
  verifyJwt,
  verifyAdmin,
  deleteReport
)
export { ReportRouter }
