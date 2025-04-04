const AWS = require('aws-sdk');
const multer = require('multer');
const { Op } = require('sequelize');
const Event = require('../Models/eventModel');
const sendResponse = require('../Utilies/response');
const { eventSchema } = require('../Validations/eventValidation');
const { getConfirmedUserEmails, sendBulkEmail } = require('../Utilies/emailUtils');
require('dotenv').config();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Function to upload a file to S3
const uploadToS3 = async (file) => {
  const fileKey = `events/${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const uploadedFile = await s3.upload(params).promise();
  return uploadedFile.Location;
};

// List Events (with pagination & search)
const listEvents = async (req, res) => {
  try {
    
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const events = await Event.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    sendResponse(res, 200, 'success', 'Events fetched successfully', {
      total: events.count,
      page: parseInt(page),
      totalPages: Math.ceil(events.count / limit),
      data: events.rows,
    });
  } catch (error) {
    sendResponse(res, 500, 'error', error.message);
  }
};

// Create or Update Event (Handles File Upload)
const createOrUpdateEvent = async (req, res) => {
  try {
    const { error } = eventSchema.validate(req.body);
    if (error) return sendResponse(res, 400, 'error', error.details[0].message);

    let event;
    const { id } = req.params;
    let isNewEvent = false;

    if (id) {
      // Update existing event
      event = await Event.findByPk(id);
      if (!event) return sendResponse(res, 404, 'error', 'Event not found');
      await event.update(req.body);
    } else {
      // Create new event
      isNewEvent = true;
      event = await Event.create(req.body);
    }

    if (req.file) {
      const fileUrl = await uploadToS3(req.file);
      event.fileUrl = fileUrl;
      await event.save();
    }
    if (isNewEvent) {
      const emails = await getConfirmedUserEmails();

      if (emails.length) {
        const subject = "New Event Published!";
        const html = `
          <h2>${event.title}</h2>
          <p>${event.description}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          ${event.fileUrl ? `<p><a href="${event.fileUrl}">Download Attachment</a></p>` : ""}
        `;
        await sendBulkEmail(emails, subject, html);
      }
    }
    const message = id ? 'Event updated successfully' : 'Event created successfully';
    sendResponse(res, id ? 200 : 201, 'success', message, event);
  } catch (error) {
    sendResponse(res, 500, 'error', error.message);
  }
};

// Delete an Event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return sendResponse(res, 404, 'error', 'Event not found');

    await event.destroy();
    sendResponse(res, 200, 'success', 'Event deleted successfully');
  } catch (error) {
    console.log(error);
    
    sendResponse(res, 500, 'error', error.message);
  }
};

const getFileUrl = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event || !event.fileUrl) return sendResponse(res, 404, 'error', 'File not found');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: event.fileUrl.split('.com/')[1],
      Expires: 200,
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    sendResponse(res, 200, 'success', 'File download link generated', { downloadUrl: signedUrl });
  } catch (error) {
    sendResponse(res, 500, 'error', error.message);
  }
};

module.exports = { upload, listEvents, createOrUpdateEvent, deleteEvent, getFileUrl };
