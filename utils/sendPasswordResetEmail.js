const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendPasswordResetEmail(email, resetUrl) {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "Wanderlust",
      email: process.env.GMAIL_USER,
    },
    to: [{ email }],
    subject: "Reset your Wanderlust password",

    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <title>Reset Your Wanderlust Password</title>
      </head>

      <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#20232a;">

        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          Reset your Wanderlust password securely. This link expires in 15 minutes.
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="background-color:#f4f6f9;padding:35px 12px;">
          <tr>
            <td align="center">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eaedf1;">

                <!-- Brand header -->
                <tr>
                  <td align="center"
                    style="padding:30px 20px 25px;background:#ffffff;border-bottom:1px solid #f0f1f3;">

                    <div style="font-size:29px;line-height:1.3;font-weight:800;letter-spacing:-1px;color:#fe424d;">
                      Wanderlust<span style="color:#252832;">.</span>
                    </div>

                    <div style="margin-top:7px;font-size:10px;letter-spacing:2.5px;font-weight:bold;color:#9298a3;">
                      DISCOVER YOUR NEXT JOURNEY
                    </div>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding:36px 32px 20px;">

                    <div style="text-align:center;margin-bottom:22px;">
                      <div style="display:inline-block;width:66px;height:66px;line-height:66px;border-radius:20px;background:#fff0f1;color:#fe424d;font-size:29px;">
                        &#128273;
                      </div>
                    </div>

                    <div style="text-align:center;font-size:11px;font-weight:bold;letter-spacing:2px;color:#fe424d;">
                      ACCOUNT SECURITY
                    </div>

                    <h1 style="margin:12px 0 14px;text-align:center;font-size:27px;line-height:1.3;letter-spacing:-0.7px;color:#20232a;">
                      Forgot your password?
                    </h1>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.9;color:#626978;">
                      Hello,
                    </p>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.9;color:#626978;">
                      We received a request to reset the password for your Wanderlust account. No worries — it happens!
                    </p>

                    <p style="margin:0 0 27px;font-size:15px;line-height:1.9;color:#626978;">
                      Click the button below to securely create a new password and get back to your next adventure.
                    </p>

                    <!-- Reset button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:0 0 28px;">
                          <a href="${resetUrl}"
                            style="display:inline-block;padding:16px 24px;background:#fe424d;color:#ffffff;text-decoration:none;text-align:center;font-size:15px;font-weight:bold;border-radius:12px;">
                            Reset My Password &nbsp; &#8594;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry notice -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                      style="background:#fff7f0;border:1px solid #ffeadb;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <div style="font-size:13px;font-weight:bold;color:#a65b26;margin-bottom:6px;">
                            &#9200; Security reminder
                          </div>
                          <div style="font-size:13px;line-height:1.8;color:#785f50;">
                            This password-reset link expires in <strong>15 minutes</strong> and can only be used once.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 0;font-size:13px;line-height:1.9;color:#777e89;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged unless it is reset.
                    </p>

                    <p style="margin:18px 0 0;font-size:12px;line-height:1.8;color:#9298a3;">
                      If the button doesn't work, try opening this email in another browser.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:23px 25px;background:#fafbfc;border-top:1px solid #eef0f3;text-align:center;">

                    <div style="font-size:13px;font-weight:bold;color:#353945;">
                      Wanderlust
                    </div>

                    <p style="margin:8px 0 0;font-size:11px;line-height:1.8;color:#9298a3;">
                      This is an automated account-security email.<br>
                      Please keep your password and reset link private.
                    </p>

                    <div style="margin-top:16px;font-size:10px;color:#b0b4bd;">
                      &copy; Wanderlust. All rights reserved.
                    </div>

                  </td>
                </tr>

              </table>

              <p style="margin:18px 0 0;text-align:center;font-size:11px;line-height:1.7;color:#a0a5af;">
                Sent securely by Wanderlust.
              </p>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
  });
}

module.exports = sendPasswordResetEmail;
