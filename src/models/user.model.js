import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true
    },
    PassWord: {
      type: String,
      required: true
    },
    confirmPassWord: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },

    SSN: {
      type: String,
      required: [true, 'SSN Is Required']
    },

    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('PassWord')) return next()
  this.PassWord = await bcrypt.hash(this.PassWord, 10)
  this.confirmPassWord = await bcrypt.hash(this.confirmPassWord, 10)
  next()
})

userSchema.methods.isPassWordCorrect = async function (password) {
  return await bcrypt.compare(password, this.PassWord)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email
    },
    process.env.ACCESSTOKEN_SECRET,
    {
      expiresIn: process.env.ACCESSTOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESHTOKEN_SECRET,
    {
      expiresIn: process.env.REFRESHTOKEN_EXPIRY
    }
  )
}
export const User = mongoose.model('User', userSchema)

// full name,email,password,confirmPassword,ssn
