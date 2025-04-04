require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const fs = require("fs");
const express = require("express");
const app = express();
const JOB_PORTAL_URL =
  "https://gwu-studentemployment.peopleadmin.com/postings/search?utf8=%E2%9C%93&query=&query_v0_posted_at_date=&1387%5B%5D=5&1389%5B%5D=1&commit=Search";

const mongoose = require("mongoose");
const Job = require("./models/Job");
async function saveJobs(jobs) {
  await Job.deleteMany({}); // Clear old jobs before inserting new ones
  await Job.insertMany(jobs);
}

// Load environment variables
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function fetchJobListings() {
  try {
    const response = await axios.get(JOB_PORTAL_URL);
    const html = response.data;
    const $ = cheerio.load(html);

    let jobs = [];

    $(".job-item.job-item-posting").each((_, element) => {
      const title = $(element).find("h3 a").text().trim();
      const link =
        "https://gwu-studentemployment.peopleadmin.com" +
        $(element).find("h3 a").attr("href");
      const department = $(element)
        .find(".col-md-2.col-xs-12.job-title.job-title-text-wrap")
        .eq(2)
        .text()
        .trim();
      const workType = $(element)
        .find(".col-md-2.col-xs-12.job-title.job-title-text-wrap")
        .eq(3)
        .text()
        .trim();
      const closingDate = $(element)
        .find(".col-md-2.col-xs-12.job-title.job-title-text-wrap")
        .eq(4)
        .text()
        .trim();
      const description = $(element).find(".job-description").text().trim();

      jobs.push({
        title,
        link,
        department,
        workType,
        closingDate,
        description,
      });
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return [];
  }
}

async function sendEmailNotification(newJobs) {
  const recipients = process.env.EMAIL_RECIPIENTS?.split(',').map(email => email.trim());

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "patilanket11@gmail.com",
    bcc: recipients,
    subject: "New Job Posting Alert - GWU Talent Management",
    text: `New job postings:\n\n${newJobs
      .map((job) => `${job.title}\n${job.link}\n`)
      .join("\n\n")}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


async function checkForNewJobs() {
  console.log("Checking for new jobs...");
const currentJobs = await fetchJobListings();
const previousJobs = await Job.find({});
console.log(currentJobs.length);
console.log(previousJobs.length);

// Create a set of existing job identifiers (e.g., title + link)
const previousJobIdentifiers = new Set(
  previousJobs.map((job) => `${job.title}-${job.link}`)
);

const newJobs = currentJobs.filter(
  (job) => !previousJobIdentifiers.has(`${job.title}-${job.link}`)
);

if (newJobs.length > 0) {
  console.log("New jobs found! Saving to database and sending email...");
  await saveJobs(currentJobs); // Save only new jobs, not all
  await sendEmailNotification(newJobs);
} else {
  console.log("No new jobs found.");
}

}

checkForNewJobs().then(() => process.exit()).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
