import express from 'express';
import {
  applyForJob,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats,
} from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ✅ Use upload.single('resume') – expects a file field named 'resume'
router.post('/', protect, upload.single('resume'), applyForJob);

router.get('/my-applications', protect, getUserApplications);
router.get('/stats', protect, getApplicationStats);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;