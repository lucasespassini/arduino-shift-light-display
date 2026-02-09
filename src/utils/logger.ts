import { appConfig } from "../config";

type LogLevel = "error" | "warn" | "info" | "debug";

class Logger {
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  private currentLevel: LogLevel;

  constructor(level: LogLevel = "info") {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.currentLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog("error")) {
      const meta =
        error instanceof Error
          ? { error: error.message, stack: error.stack }
          : { error };
      console.error(this.formatMessage("error", message, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message, meta));
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message, meta));
    }
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

export const logger = new Logger(appConfig.logging.level);
