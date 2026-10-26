const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(email, verificationUrl) {
  await transporter.sendMail({
    from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your Wanderlust account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
        <h2 style="color: #166534;">Welcome to Wanderlust!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #166534; color: white;
                  padding: 12px 20px; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p style="margin-top: 20px;">This link will expire in 15 minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = sendVerificationEmail;
