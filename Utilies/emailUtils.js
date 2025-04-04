require("dotenv").config();
const nodemailer = require('nodemailer');
const AWS = require("aws-sdk");

const cognito = new AWS.CognitoIdentityServiceProvider();

const getConfirmedUserEmails = async () => {
  const confirmedEmails = [];
  let paginationToken = undefined;

  try {
    let userPoolId = process.env.POOL_ID
    do {
      const params = {
        UserPoolId: userPoolId,
        PaginationToken: paginationToken,
      };

      const { Users, PaginationToken } = await cognito.listUsers(params).promise();

      Users?.forEach((user) => {
        if (user.UserStatus === "CONFIRMED") {
          const email = user.Attributes?.find(attr => attr.Name === "email")?.Value;
          if (email) confirmedEmails.push(email);
        }
      });

      paginationToken = PaginationToken;
    } while (paginationToken);

    return confirmedEmails;
  } catch (error) {
    console.error("Failed to fetch confirmed user emails:", error);
    throw new Error("Error retrieving confirmed user emails.");
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", 
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_EMAIL_PASSWORD,
  },
});


const sendWelcomeEmail = async (name, email) => {
  const emailTemplate = `
    <html>
      <body>
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering with us. We are excited to have you on board!</p>
        <p>Please confirm your email by following the instructions we sent you in the verification email.</p>
        <p>If you have any questions, feel free to reach out to us at support@example.com.</p>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL, 
      to: email, 
      subject: "Welcome to Our Service!", 
      html: emailTemplate, 
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error.message);
    throw error;
  }
};

const sendBulkEmail = async (emails, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails.join(","), 
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Emails sent successfully");
  } catch (error) {
    console.error("Error sending bulk email:", error);
    throw new Error("Failed to send emails");
  }
};


module.exports = { sendWelcomeEmail,sendBulkEmail,getConfirmedUserEmails };
