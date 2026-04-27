import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'review', 'shortlisted', 'interview', 'rejected', 'hired'],
    default: 'pending',
  },
  coverLetter: String,
  resume: String,
  matchScore: Number,
  notes: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;