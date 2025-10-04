import { Router } from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { registerUser } from '../controllers/users.controller.js'

const router = Router()
console.log('kuchc aaya ya nhi', registerUser)

router
  .route('/registerUser')
  .post(upload.fields([{ name: 'avatar', maxCount: 1 }]), registerUser)

export { router } // ab isko app me import kro
