export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HardwareError extends AppError {
  constructor(message: string, code: string = "HARDWARE_ERROR") {
    super(message, code, 500, true);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, code: string = "CONFIGURATION_ERROR") {
    super(message, code, 500, true);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code: string = "NETWORK_ERROR") {
    super(message, code, 500, true);
  }
}
