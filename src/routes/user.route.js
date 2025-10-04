import { Router } from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { LoginUser, registerUser } from '../controllers/users.controller.js'

const router = Router()
console.log('kuchc aaya ya nhi', registerUser)

router
  .route('/registerUser')
  .post(upload.fields([{ name: 'avatar', maxCount: 1 }]), registerUser)

router.route('/loginUser').post(LoginUser)

export { router } // ab isko app me import kro
