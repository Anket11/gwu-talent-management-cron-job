const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    link: String,
    department: String,
    workType: String,
    closingDate: String,
    description: String,
    datePosted: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
