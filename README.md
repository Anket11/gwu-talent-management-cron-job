# Colonial Careers - Job Scraper and Notifier

## Overview
Colonial Careers is a **Node.js application** that scrapes the GWU Student Employment portal, stores job postings in a **MongoDB database**, and notifies users via **email** when new job postings are available. The project runs on an **Express.js server** and can be triggered manually via an API endpoint. (Only works for Non FWS and Foggy Bottom campus)

## Features
- **Scrapes job listings** from the GWU job portal
- **Detects new job postings** by comparing with previous listings
- **Stores job postings in MongoDB Atlas**
- **Sends email notifications** when new jobs are found
- **Provides an API endpoint** to manually trigger job checks
- **Runs automatically using cron jobs**

## Technologies Used
- **Node.js** - Backend server
- **Express.js** - API framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ORM for MongoDB
- **Axios** - Fetching HTML content
- **Cheerio** - Web scraping
- **Nodemailer** - Email notifications
- **Node-cron** - Scheduled job execution
- **dotenv** - Environment variable management

## Setup Instructions
### 1. Clone the Repository
```sh
git clone https://github.com/Anket11/gwu-talent-management-cron-job
cd gwu-talent-management-cron-job
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Create a `.env` File
Create a `.env` file in the root directory with the following content:
```ini
PORT=3000
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.z4wmh.mongodb.net/db-name?retryWrites=true&w=majority
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```
> **Note:** If using Gmail, generate an **App Password** instead of using your real password.

### 4. Start the MongoDB Database
Ensure you have a MongoDB Atlas cluster set up and **replace `MONGO_URI`** in `.env` with your connection string.

### 5. Run the Server
```sh
node script.js
```

The server will start on `http://localhost:3000`.

## Usage
### 1. Manually Check for Jobs
Trigger a job check manually by visiting:
```
http://localhost:3000/check-jobs
```
This will fetch new job listings, compare them with previous jobs, save them to the database, and send email notifications if new jobs are found.

### 2. Automate Job Checks
The script runs periodically using `cron-job`. It is currently configured to run 15 minutes. Modify the schedule if needed.

## Code Structure
```
├── models
│   ├── Job.js               # Mongoose schema for job postings
├── server.js                # Main server script
├── .env                     # Environment variables
├── package.json             # Node.js dependencies
```

## Troubleshooting
### 1. MongoDB Connection Issues
- Ensure your **MongoDB URI** is correct.
- Check **MongoDB Atlas IP whitelist settings**.

### 2. Emails Not Being Sent
- Ensure your **EMAIL_USER** and **EMAIL_PASS** are correct.
- If using Gmail, enable **App Passwords**.
- Check if emails are landing in **spam**.

### 3. Scraper Not Fetching Jobs
- Run `console.log(html)` inside `fetchJobListings()` to debug.
- The job portal structure may have changed—update the **Cheerio selectors**.

## Future Enhancements
- Allow users to **subscribe** to job alerts with custom filters.
- Implement **Twilio SMS notifications**.
- Deploy as a **Docker container** for easier deployment.

## License
MIT License © 2025 Colonial Careers

