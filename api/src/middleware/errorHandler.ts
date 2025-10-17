import { Request, Response, NextFunction } from 'express';
import { AppError } from '@sjsu-mhc/types';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle known application errors
  if ('code' in error) {
    const appError = error as AppError;
    return res.status(getStatusCodeFromErrorCode(appError.code)).json({
      success: false,
      error: appError.code,
      message: appError.message,
      details: appError.details,
      timestamp: appError.timestamp
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: { validation: error.message }
    });
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Invalid JSON in request body'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : error.message,
    timestamp: new Date().toISOString()
  });
};

function getStatusCodeFromErrorCode(code: string): number {
  const statusCodeMap: Record<string, number> = {
    'VALIDATION_ERROR': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'CONFLICT': 409,
    'RATE_LIMITED': 429,
    'EXTERNAL_API_ERROR': 502,
    'INTERNAL_SERVER_ERROR': 500
  };

  return statusCodeMap[code] || 500;
}
