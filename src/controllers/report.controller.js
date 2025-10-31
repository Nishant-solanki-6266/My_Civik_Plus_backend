import { Report } from '../models/report.model.js'
import { User } from '../models/user.model.js'
import { apiError } from '../utils/apiError.js'
import { apiResponce } from '../utils/apiResponce.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const createReport = async (req, res) => {
  const { title, description, location, category } = req.body

  // Validation
  if (
    [title, description, location, category].some(field => field.trim() === '')
  ) {
    throw new apiError(400, 'All fields are required')
  }

  //image lekar aaye
  try {
    const ReportImageLocalPath = req.file.path
    if (!ReportImageLocalPath) {
      throw new apiError(400, 'Report Image Not Get')
    }
    //in cloudinary upload
    const ReportImg = await uploadOnCloudinary(ReportImageLocalPath)
    if (!ReportImg) {
      throw new apiError(400, 'Report img is Missing')
    }

    // create
    const report = await Report.create({
      title,
      description,
      location,
      category,
      image: ReportImg.url,
      createdBy: req.user._id
    })
    // console.log("l",req.user);

    const createReport = await report.populate('createdBy', 'fullName email')
    // console.log(createReport.createdBy.fullName);

    if (!createReport) {
      throw new apiError(400, 'Something Went Wrong')
    }
    return res
      .status(201)
      .json(
        new apiResponce(200, { createReport }, 'Report submitted successfully')
      )
  } catch (error) {
    console.error('Create Report Error:-', error)
  }
}

const getAllReports = asyncHandler(async (req, res) => {
  try {
    const reports = await Report.find().populate('createdBy', 'fullName email')
    console.log('re', reports)

    return res.status(200).json(
      new apiResponce(
        200,
        {
          reports,
          Count: reports.length
        },
        'All Report Fetched!'
      )
    )
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const updateReportStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const report = await Report.findByIdAndUpdate(id, { status }, { new: true })
    return res.json(new apiResponce(200, { report }, 'Status updated'))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const deleteReport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    // Report dhundho
    const report = await Report.findById(id)
    if (!report) {
      throw new apiError(400, 'Report not found')
    }

    if (
      report.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new apiError(400, 'Not authorized to delete this report')
    }

    // Delete karo
    const deleteReport = await Report.findByIdAndDelete(id)

    res
      .status(200)
      .json(
        new apiResponce(200, { deleteReport }, 'Report deleted successfully')
      )
  } catch (error) {
    console.log('Delete ApI Error:-', error)
  }
})

export { createReport, getAllReports, updateReportStatus, deleteReport }
