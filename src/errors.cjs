'use strict';

class AppError extends Error {
  constructor(message, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

function publicError(error) {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code, details: error.details };
  }

  return {
    message: '操作失败，请稍后重试。',
    code: 'UNEXPECTED_ERROR',
    details: null,
  };
}

module.exports = { AppError, publicError };
