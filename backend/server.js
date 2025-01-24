// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // To load environment variables

const app = express();
const PORT = process.env.PORT || 3001; // Change to 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Hackathon Registration Email Service!');
});

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to send registration emails
app.post('/register', async (req, res) => {
    const members = req.body.members;

    if (!members || !Array.isArray(members)) {
        return res.status(400).send('Invalid request');
    }

    const emailPromises = members.map(member => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: member.email,
            subject: 'Registration Successful',
            text: `Hello ${member.name}, you have successfully registered for the hackathon!`
        };
        return transporter.sendMail(mailOptions);
    });

    try {
        await Promise.all(emailPromises);
        return res.status(200).send('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).send('Failed to send emails');
    }
});
app.post('/send-email', async (req, res) => {
    const { message, recipient } = req.body;

    // Create a transporter using your email service
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Replace with your email service (e.g., Gmail, Yahoo, etc.)
        auth: {
            user: process.env.EMAIL_USER, // Use the environment variable
            pass: process.env.EMAIL_PASS, // Use the environment variable
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address from environment variable
        to: recipient, // Recipient address
        subject: 'Hackathon Update', // Subject line
        text: message, // Email message body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
