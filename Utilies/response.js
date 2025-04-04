const sendResponse = (res, statusCode, status, message, data = {}) => {
  return res.status(statusCode).json({
    status: status,
    message: message,
    data: data,
  });
};

module.exports = sendResponse;
