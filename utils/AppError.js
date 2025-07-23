export class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // this.message = message
    this.statusCode = statusCode;

    // Maintains the correct stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}