module.exports = (statusCode, errorMessage) => {
    const error = new Error(errorMessage);
    error.statusCode = statusCode;
    throw error;
}