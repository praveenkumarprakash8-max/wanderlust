const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendVerificationEmail(email, verificationUrl) {
  try {
    const currentYear = new Date().getFullYear();

    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Wanderlust",
        email: process.env.GMAIL_USER,
      },

      to: [{ email }],

      subject: "Verify Your Email | Welcome to Wanderlust",

      htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Wanderlust Account</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #fff5f5;
  font-family: Arial, Helvetica, sans-serif;
  color: #333333;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #fff5f5; padding: 35px 12px;">

    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width: 540px;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #f1e5e5;
          ">

          <!-- HEADER -->
          <tr>
            <td align="center" style="
              background-color: #fe424d;
              padding: 32px 20px;
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 0.5px;
              ">
                Wanderlust
              </h1>

              <p style="
                margin: 9px 0 0;
                color: #ffffff;
                font-size: 12px;
                letter-spacing: 2px;
              ">
                EXPLORE • DISCOVER • TRAVEL
              </p>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 38px 28px;">

              <h2 style="
                margin: 0 0 18px;
                color: #fe424d;
                font-size: 25px;
                text-align: center;
              ">
                Welcome to Wanderlust!
              </h2>

              <p style="
                margin: 0 0 16px;
                color: #444444;
                font-size: 15px;
                line-height: 1.8;
              ">
                Hello Traveler,
              </p>

              <p style="
                margin: 0 0 28px;
                color: #666666;
                font-size: 15px;
                line-height: 1.8;
                text-align: center;
              ">
                Thank you for joining Wanderlust! We're excited to
                have you with us.
                Please verify your email address to activate your
                account and start exploring.
              </p>

              <!-- BUTTON -->
              <table align="center" cellpadding="0" cellspacing="0"
                border="0">
                <tr>
                  <td align="center" bgcolor="#fe424d"
                    style="border-radius: 8px;">

                    <a href="${verificationUrl}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 15px 34px;
                        color: #ffffff;
                        background-color: #fe424d;
                        font-size: 15px;
                        font-weight: bold;
                        text-decoration: none;
                        border-radius: 8px;
                      ">
                      Verify My Email
                    </a>

                  </td>
                </tr>
              </table>

              <p style="
                margin: 28px 0 8px;
                color: #777777;
                font-size: 13px;
                line-height: 1.7;
                text-align: center;
              ">
                This verification link will expire in 24 hours.
              </p>

              <p style="
                margin: 15px 0 0;
                color: #999999;
                font-size: 12px;
                line-height: 1.7;
                text-align: center;
              ">
                If the button doesn't work, copy and paste this link
                into your browser:
              </p>

              <p style="
                margin: 10px 0 0;
                text-align: center;
                font-size: 12px;
                line-height: 1.6;
                word-break: break-all;
              ">
                <a href="${verificationUrl}"
                  style="color: #fe424d; text-decoration: underline;">
                  Verify your account
                </a>
              </p>

              <p style="
                margin: 25px 0 0;
                color: #888888;
                font-size: 13px;
                line-height: 1.7;
                text-align: center;
              ">
                If you did not create a Wanderlust account,
                you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="
              padding: 24px 20px;
              background-color: #fafafa;
              border-top: 1px solid #eeeeee;
            ">

              <p style="
                margin: 0;
                color: #fe424d;
                font-size: 16px;
                font-weight: bold;
              ">
                Wanderlust
              </p>

              <p style="
                margin: 8px 0 0;
                color: #999999;
                font-size: 12px;
                line-height: 1.6;
              ">
                Explore the world. Discover new experiences.
              </p>

              <p style="
                margin: 14px 0 0;
                color: #aaaaaa;
                font-size: 11px;
              ">
                © ${currentYear} Wanderlust. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
      `,
    });

    console.log(`Verification email sent to: ${email}`);
  } catch (error) {
    console.error("Brevo email failed:", error.message);
    throw error;
  }
}

module.exports = sendVerificationEmail;
