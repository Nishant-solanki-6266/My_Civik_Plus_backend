import { apiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiResponce } from '../utils/apiResponce.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async UserID => {
  try {
    const user = await User.findById(UserID) // yha await nhi lgaya dekh lena bhai
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false }) // yha only user pr save hua na ki databse me
    return { accessToken, refreshToken }
  } catch (error) {
    throw apiError(500, 'Token Generate Failed')
  }
}
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, PassWord, confirmPassWord, SSN } = req.body

  console.log(fullName)

  if (
    [fullName, email, PassWord, confirmPassWord, SSN].some(fields => {
      return fields.trim() === ''
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

const LoginUser = asyncHandler(async (req, res) => {
  const { SSN, PassWord, confirmPassWord } = req.body

  if (!(SSN && PassWord && confirmPassWord)) {
    throw new apiError(400, 'All Field are Required')
  }

  const user = await User.findOne({
    $or: [{ SSN }, { PassWord }, { confirmPassWord }]
  })

  if (!user) {
    throw new apiError(400, 'User are not  Exist')
  }

  const isPassWordValid = await user.isPassWordCorrect(PassWord)
  if (!isPassWordValid) {
    throw new apiError(400, 'Invalid User Creaditials')
  }

  const isConfirmPassWordValid = await user.isConfirmPassWordCorrect(
    confirmPassWord
  )
  if (!isConfirmPassWordValid) {
    throw new apiError(400, 'Invalid User Creaditials')
  }
  if (!isPassWordValid || !isConfirmPassWordValid) {
    throw new apiError(400, 'PassWord Do Not Match')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  )

  const responce = await User.findById(user._id).select(
    '-refreshToken -PassWord'
  )

  const option = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .cookie('AccessToken', accessToken, option)
    .cookie('RefreshToken', refreshToken, option)
    .json(
      new apiResponce(
        200,
        { responce, accessToken, refreshToken },
        'Loggin User successFully'
      )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 } // database logterm wala hta dega
    },
    { new: true }
  )
  // console.log(user)

  const option = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie('AccessToken', option) //
    .clearCookie('RefreshToken', option)
    .json(new apiResponce(200, {}, 'LogOut SuccessFull!'))
})

const refAccessToken = asyncHandler(async (req, res) => {
  const icomingRefreshToken = req.cookies?.RefreshToken

  if (!icomingRefreshToken) {
    throw new apiError(400, 'RefreshToken Not Get')
  }
  try {
    const decodedToken = jwt.verify(
      icomingRefreshToken,
      process.env.REFRESHTOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id).select('-PassWord')
    if (!user) {
      throw new apiError(400, 'not.........................')
    }

    if (icomingRefreshToken !== user.refreshToken) {
      throw new apiError(400, 'User RefreshToken is Expired!')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?._id
    )

    const option = {
      httpOnly: true,
      secure: true
    }

    return res
      .status(200)
      .cookie('AccessToken', accessToken, option)
      .cookie('RefreshToken', refreshToken, option)
      .json(
        new apiResponce(
          200,
          { accessToken, refreshToken },
          ' Update AccessToken and RefreshToken!'
        )
      )
  } catch (error) {
    console.log('refreshToken Api Error', error)
  }
})

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPasswprd, newPassword, confirmNewPassword } = req.body

  const user = await User.findById(req.user?._id)

  const isPassWordCorrect = await user.isPassWordCorrect(oldPasswprd) // mera password hau 123457  ,abhi dala 12345
  if (!isPassWordCorrect) {
    throw new apiError(400, 'PassWord is incorrect!')
  }
  req.user.PassWord = newPassword
  req.user.confirmPassWord = confirmNewPassword
  req.user.save({ validateBeforeSave: true })
  console.log(user) // yha hmne user me password confirm password add kr diya hai isliye show ho rha hai ... auth me password hide kr diya tha

  return res
    .status(200)
    .json(new apiResponce(200, { user }, 'New PassWord Updated!'))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, SSN } = req.body
  if (
    [fullName, email, SSN].some(field => {
      return field.trim() === ''
    })
  ) {
    throw new apiError(400, 'All Field Are Required!')
  }
  // req.user.fullName = fullName
  // req.user.email = email
  // req.user.SSN = SSN
  // req.user.save({ validateBeforeSave: true })  ese bhi kr skte hai but ak new tarika
  try {
    const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: { fullName, email, SSN }
    })
    console.log(user)

    return res
      .status(200)
      .json(new apiResponce(200, { user }, 'Account Updated!'))
    // console.log(fullName, email, SSN)
  } catch (error) {
    console.log('Updated Account Api Error:-', error)
  }
})
export {
  registerUser,
  LoginUser,
  logOutUser,
  refAccessToken,
  updatePassword,
  updateAccountDetails
}
