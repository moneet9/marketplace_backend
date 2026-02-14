import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.mail,      // your Gmail
    pass: process.env.mail_password,    // Gmail App Password
  },
});

// Email options
const mailOptions = {
  from: `"Test Email" <${process.env.mail}>`,
  to: "", // Replace with a valid recipient email
  subject: "Test Email",
  text: "Hello! This email was sent using Nodemailer.",
  html: "<h2>Hello!</h2><p>This email was sent using <b>Nodemailer</b>.</p>",
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent successfully:", info.response);
  }
});
