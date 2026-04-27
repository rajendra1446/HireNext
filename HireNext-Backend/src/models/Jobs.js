import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add company name'],
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
  },
  type: {
    type: String,
    enum: ['fulltime', 'parttime', 'remote', 'contract', 'internship'],
    required: true,
  },
  category: String,
  experience: String,
  salary: String,
  description: {
    type: String,
    required: [true, 'Please add description'],
  },
  requirements: String,
  tags: [String],
  deadline: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicantsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model('Job', jobSchema);
export default Job;