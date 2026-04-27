import Application from '../models/Application.js';
import Job from '../models/Jobs.js';
import ErrorHandler from '../utils/errorHandlers.js';

// @desc    Apply for job
// @route   POST /api/applications
// @access  Private
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    const resumeFile = req.file; // multer adds file info here

    if (!resumeFile) {
      return next(new ErrorHandler('Resume is required', 400));
    }

    // Save file path or upload to cloud (e.g., Cloudinary, AWS S3)
    const resumeUrl = `/uploads/resumes/${resumeFile.filename}`; // local path

    // Check existing application
    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user.id,
    });

    if (existingApplication) {
      return next(new ErrorHandler('Already applied for this job', 400));
    }

    // Check job exists and active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return next(new ErrorHandler('Job not found or inactive', 404));
    }

    // Create application with resume URL
    const application = await Application.create({
      job: jobId,
      user: req.user.id,
      coverLetter,
      resume: resumeUrl, // add resume field in your schema
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user applications
// @route   GET /api/applications/my-applications
// @access  Private
export const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title company location type salary')
      .sort('-appliedAt');

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job applications (for recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter)
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return next(new ErrorHandler('Job not found', 404));
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized', 403));
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('user', 'fullName email phone location profile')
      .sort('-appliedAt');

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return next(new ErrorHandler('Application not found', 404));
    }

    // Check if user owns the job or is admin
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized', 403));
    }

    application.status = status;
    application.notes = notes;
    application.updatedAt = Date.now();
    await application.save();

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application stats
// @route   GET /api/applications/stats
// @access  Private
export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};