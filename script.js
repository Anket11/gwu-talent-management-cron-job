require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');
const app = express();
const JOB_PORTAL_URL = 'https://gwu-studentemployment.peopleadmin.com/postings/search?utf8=%E2%9C%93&query=&query_v0_posted_at_date=&1387%5B%5D=5&1389%5B%5D=1&commit=Search';
const DATA_FILE = 'jobs.json';

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
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

        $('.job-item.job-item-posting').each((_, element) => {
            const title = $(element).find('h3 a').text().trim();
            const link = 'https://gwu-studentemployment.peopleadmin.com' + $(element).find('h3 a').attr('href');
            const department = $(element).find(".col-md-2.col-xs-12.job-title.job-title-text-wrap").eq(2).text().trim();
            const workType = $(element).find(".col-md-2.col-xs-12.job-title.job-title-text-wrap").eq(3).text().trim();
            const closingDate = $(element).find(".col-md-2.col-xs-12.job-title.job-title-text-wrap").eq(4).text().trim();
            const description = $(element).find('.job-description').text().trim();

            jobs.push({ title, link, department, workType, closingDate, description });
        });

        return jobs;
    } catch (error) {
        console.error('Error fetching job listings:', error);
        return [];
    }
}

function loadPreviousJobs() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
}

function saveJobs(jobs) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf8');
}

async function sendEmailNotification(newJobs) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Job Posting Alert - GWU',
        text: `New job postings:\n\n${newJobs.map(job => `${job.title}\n${job.link}\n`).join('\n\n')}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function checkForNewJobs() {
    console.log('Checking for new jobs...');
    const currentJobs = await fetchJobListings();
    const previousJobs = loadPreviousJobs();

    const previousJobTitles = new Set(previousJobs.map(job => job.title));
    const newJobs = currentJobs.filter(job => !previousJobTitles.has(job.title));

    if (newJobs.length > 0) {
        console.log('New jobs found! Sending email...');
        await sendEmailNotification(newJobs);
        saveJobs(currentJobs);
    } else {
        console.log('No new jobs found.');
    }
}

// Function to print all job listings
async function printJobs() {
    const jobs = await fetchJobListings();
    if (jobs.length === 0) {
        console.log('No jobs found.');
    } else {
        jobs.forEach((job, index) => {
            console.log(`\nJob #${index + 1}`);
            console.log(`Title: ${job.title}`);
        });
    }
}

// Run every hour
// cron.schedule('*/1 * * * *', checkForNewJobs); // Runs every 5 minutes

// console.log('Job monitoring script started...\n');
// printJobs();
// checkForNewJobs();
app.get('/check-jobs', async (req, res) => {
    await checkForNewJobs();
    res.send('Job check triggered!');
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
