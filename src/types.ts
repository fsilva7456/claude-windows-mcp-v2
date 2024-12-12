export interface CommandResult {
  stdout: string;
  stderr: string;
  status: number;
}

export interface MCPConfig {
  restrictedCommands?: string[];
  restrictedPaths?: string[];
}

export class CommandExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}