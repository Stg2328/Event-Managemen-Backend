const twilio = require('twilio');

const client = twilio(process.env.twilio_account_sid, process.env.twilio_account_auth_token);

const sendWelcomeSMS = async (phoneNumber) => {
  try {
    const message = await client.messages.create({
      to: `${phoneNumber}`,  
      from: '+1 413 307 4575', 
      body: 'Welcome to the STG Event Management! We are excited to have you on board.',
    });
    console.log(`SMS sent to +91${phoneNumber}, SID: ${message.sid}`);
  } catch (error) {
    console.error(`Error sending SMS to +91${phoneNumber}:`, error.message);
    throw error; 
  }
};

module.exports = { sendWelcomeSMS };
