/**
 * Simple logger utility for consistent logging across the application
 */
export class Logger {
  private static formatMessage(level: string, message: string): string {
    return `[${new Date().toISOString()}] ${level}: ${message}`;
  }

  static info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  static error(message: string, error?: Error): void {
    console.error(this.formatMessage('ERROR', message));
    if (error) {
      console.error(error);
    }
  }

  static warn(message: string): void {
    console.warn(this.formatMessage('WARN', message));
  }
} 