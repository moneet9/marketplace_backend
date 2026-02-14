import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
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

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'verification') => {
  let subject, message;
  
  switch(type) {
    case 'verification':
      subject = 'Verify Your Account';
      message = `Your verification code is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;
      break;
    case 'password-reset':
      subject = 'Password Reset OTP';
      message = `Your password reset code is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;
      break;
    case 'password-change':
      subject = 'Verify Password Change';
      message = `You requested to change your password. Your verification code is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;
      break;
    case 'email-change':
      subject = 'Verify Email Change';
      message = `You requested to change your email address. Your verification code is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;
      break;
    default:
      subject = 'Verification OTP';
      message = `Your verification code is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;
  }

  const mailOptions = {
    from: `"Vintage Marketplace" <${process.env.mail}>`,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff9f0;
              border-radius: 10px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
              color: white;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 30px;
              background-color: white;
              border-radius: 0 0 10px 10px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              color: #d97706;
              padding: 20px;
              background-color: #fff9f0;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vintage Marketplace</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>${message}</p>
              <div class="otp-code">${otp}</div>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>For security reasons, do not share this code with anyone.</p>
            </div>
            <div class="footer">
              <p>© 2026 Vintage Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export default { generateOTP, sendOTPEmail };
