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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Wanderlust account</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background-color: #fff5f5;
          font-family: Arial, Helvetica, sans-serif;
          color: #333333;
        ">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color: #fff5f5; padding: 40px 15px;"
          >
            <tr>
              <td align="center">

                <!-- Main Email Card -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    max-width: 520px;
                    background-color: #ffffff;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid #eeeeee;
                  "
                >

                  <!-- Header -->
                  <tr>
                    <td
                      align="center"
                      style="
                        background-color: #fe424d;
                        padding: 30px 20px;
                      "
                    >
                      <h1 style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 30px;
                        font-weight: bold;
                        letter-spacing: 0.5px;
                      ">
                        Wanderlust
                      </h1>

                      <p style="
                        margin: 8px 0 0;
                        color: #ffffff;
                        font-size: 13px;
                        letter-spacing: 1px;
                      ">
                        EXPLORE • DISCOVER • TRAVEL
                      </p>
                    </td>
                  </tr>

                  <!-- Email Body -->
                  <tr>
                    <td style="padding: 38px 30px 32px;">

                      <h2 style="
                        margin: 0 0 18px;
                        color: #fe424d;
                        font-size: 24px;
                        text-align: center;
                      ">
                        Welcome to Wanderlust!
                      </h2>

                      <p style="
                        margin: 0 0 28px;
                        color: #555555;
                        font-size: 15px;
                        line-height: 1.7;
                        text-align: center;
                      ">
                        Please verify your email address to activate your account.
                      </p>

                      <!-- Verify Button -->
                      <table
                        align="center"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tr>
                          <td
                            align="center"
                            bgcolor="#fe424d"
                            style="border-radius: 8px;"
                          >
                            <a
                              href="${verificationUrl}"
                              target="_blank"
                              style="
                                display: inline-block;
                                padding: 14px 32px;
                                background-color: #fe424d;
                                color: #ffffff;
                                text-decoration: none;
                                font-size: 15px;
                                font-weight: bold;
                                border-radius: 8px;
                              "
                            >
                              Verify Email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="
                        margin: 28px 0 0;
                        color: #777777;
                        font-size: 13px;
                        line-height: 1.6;
                        text-align: center;
                      ">
                        This link will expire in 24 hours.
                      </p>

                      <p style="
                        margin: 18px 0 0;
                        color: #777777;
                        font-size: 13px;
                        line-height: 1.6;
                        text-align: center;
                      ">
                        If you did not create this account, you can ignore this email.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 22px 20px;
                        background-color: #fafafa;
                        border-top: 1px solid #eeeeee;
                      "
                    >
                      <p style="
                        margin: 0;
                        color: #888888;
                        font-size: 12px;
                        line-height: 1.6;
                      ">
                        © ${new Date().getFullYear()} Wanderlust. All rights reserved.
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
