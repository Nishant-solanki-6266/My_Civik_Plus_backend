import { apiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiResponce } from '../utils/apiResponce.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, PassWord, confirmPassWord, SSN } = req.body

  console.log(fullName)

  if (
    [fullName, email, PassWord, confirmPassWord, SSN].some(fields => {
      fields.trim() === ''
    })
  ) {
    throw new apiError(400, 'All fields are Required')
  }

  const exitedUser = await User.findOne({
    $or: [{ fullName }, { email }]
  })

  if (exitedUser) {
    throw new apiError(400, 'User already exist!')
  }

  const localFilPath = req.files?.avatar[0].path

  if (!localFilPath) {
    throw new apiError(400, 'Avatar File is empty')
  }

  const avatar = await uploadOnCloudinary(localFilPath)
  if (!avatar) {
    throw new apiError(400, 'Avatar File is mising!')
  }

  const user = await User.create({
    fullName: fullName.toLowerCase(),
    email,
    PassWord,
    confirmPassWord,
    SSN,
    avatar: avatar.url
  })

  const createUser = await User.findById(user._id).select(
    '-PassWord -refreshToken'
  )

  if (!createUser) {
    throw new apiError(400, 'Something Went Wrong')
  }

  return res.status(200).json(new apiResponce(200, createUser, 'Success'))
})

export { registerUser }
