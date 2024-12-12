import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { CommandResult, MCPConfig, CommandExecutionError, ValidationError } from './types';

const execPromise = promisify(exec);

export class WindowsCommandMCP {
  private readonly RESTRICTED_COMMANDS = [
    'format',
    'del',
    'rm',
    'rmdir',
    'rd',
    'reg',
    'regedit',
    'attrib',
    'cacls'
  ];

  private readonly RESTRICTED_PATHS = [
    'C:\\Windows\\System32',
    'C:\\Windows\\System',
    'C:\\Windows'
  ];

  private currentDirectory: string;
  private restrictedCommands: string[];
  private restrictedPaths: string[];

  constructor(config?: MCPConfig) {
    this.currentDirectory = process.cwd();
    this.restrictedCommands = [
      ...this.RESTRICTED_COMMANDS,
      ...(config?.restrictedCommands || [])
    ];
    this.restrictedPaths = [
      ...this.RESTRICTED_PATHS,
      ...(config?.restrictedPaths || [])
    ];
  }

  private validateCommand(command: string): void {
    const commandParts = command.toLowerCase().split(/\s+/);
    if (!commandParts.length) {
      throw new ValidationError('Empty command');
    }

    const baseCommand = commandParts[0];
    if (this.restrictedCommands.includes(baseCommand)) {
      throw new ValidationError(`Command ${baseCommand} is restricted`);
    }

    const dangerousChars = ['|', '>', '<', '&', ';'];
    if (dangerousChars.some(char => command.includes(char))) {
      throw new ValidationError('Command contains restricted characters');
    }
  }

  private validatePath(targetPath: string): void {
    const absolutePath = path.resolve(this.currentDirectory, targetPath);

    if (this.restrictedPaths.some(restricted => 
      absolutePath.toLowerCase().startsWith(restricted.toLowerCase())
    )) {
      throw new ValidationError(`Access to path ${absolutePath} is restricted`);
    }
  }

  private sanitizeOutput(output: string): string {
    if (!output) return '';

    const patterns = [
      /password[s]?[=:].+/i,
      /secret[s]?[=:].+/i,
      /token[s]?[=:].+/i
    ];

    let sanitized = output;
    patterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  async execute_command(command: string): Promise<CommandResult> {
    try {
      this.validateCommand(command);

      const { stdout, stderr } = await execPromise(command, {
        cwd: this.currentDirectory
      });

      return {
        stdout: this.sanitizeOutput(stdout),
        stderr: this.sanitizeOutput(stderr),
        status: 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new CommandExecutionError(`Command execution failed: ${error.message}`);
      }
      throw new CommandExecutionError('Command execution failed with unknown error');
    }
  }

  async change_directory(targetPath: string): Promise<void> {
    this.validatePath(targetPath);
    this.currentDirectory = path.resolve(this.currentDirectory, targetPath);
  }

  get_current_directory(): string {
    return this.currentDirectory;
  }
}