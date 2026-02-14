import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Log environment variables for debugging
console.log('Email Config:', {
  mail: process.env.mail,
  mail_password: process.env.mail_password,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
});

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.mail,
    pass: process.env.mail_password,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export default { transporter }; // Export only the transporter for general email sending
