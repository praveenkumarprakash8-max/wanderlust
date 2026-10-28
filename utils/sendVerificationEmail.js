const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendVerificationEmail(email, verificationUrl) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Wanderlust",
        email: process.env.GMAIL_USER,
      },
      to: [{ email }],
      subject: "Verify your Wanderlust account",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
          <h2 style="color: #166534;">Welcome to Wanderlust!</h2>
          <p>Please verify your email address to activate your account.</p>
          <a href="${verificationUrl}"
             style="display: inline-block; background: #166534; color: white;
                    padding: 12px 20px; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
          <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
          <p>If you did not create this account, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Brevo email failed:", error.message);
    throw error;
  }
}

module.exports = sendVerificationEmail;
