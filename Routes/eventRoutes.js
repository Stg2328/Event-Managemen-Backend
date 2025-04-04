const express = require('express');
const { listEvents, upload, createOrUpdateEvent, deleteEvent, getFileUrl } = require('../Controllers/eventController');
const {  verifyToken } = require('../Middlewares/authMiddleware');


const router = express.Router();

router.get('/', verifyToken, listEvents);
router.post('/', verifyToken, upload.single('file'), createOrUpdateEvent);
router.put('/:id', verifyToken, upload.single('file'), createOrUpdateEvent);
router.delete('/:id', verifyToken, deleteEvent);
router.get('/:id/download', verifyToken, getFileUrl);

module.exports = router;
