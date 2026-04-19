const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  siteName: String,
  workType: String,
  priority: String,
  status: String,
  workers: String,
  location: String,
  description: String,
  remarks: String,
  photoNo: String,
  supervisor: String,
  dateTime: String,
  beforeImage: String,
  afterImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);