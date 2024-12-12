import { WindowsCommandMCP } from '../WindowsCommandMCP';
import { CommandExecutionError, ValidationError } from '../types';
import * as path from 'path';

describe('WindowsCommandMCP', () => {
  let mcp: WindowsCommandMCP;

  beforeEach(() => {
    mcp = new WindowsCommandMCP();
  });

  test('executes echo command successfully', async () => {
    const result = await mcp.execute_command('echo Hello World');
    expect(result.stdout.trim()).toBe('Hello World');
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  test('fails on restricted command', async () => {
    await expect(mcp.execute_command('del something.txt'))
      .rejects
      .toThrow(ValidationError);
  });

  test('fails on command with dangerous characters', async () => {
    await expect(mcp.execute_command('echo hello > file.txt'))
      .rejects
      .toThrow(ValidationError);
  });

  test('changes directory successfully', async () => {
    const startDir = process.cwd();
    const parentDir = path.dirname(startDir);
    
    await mcp.change_directory(parentDir);
    expect(mcp.get_current_directory()).toBe(parentDir);
  });

  test('fails on restricted path', async () => {
    await expect(mcp.change_directory('C:\\Windows\\System32'))
      .rejects
      .toThrow(ValidationError);
  });

  test('sanitizes sensitive information in output', async () => {
    const result = await mcp.execute_command('echo password=secret123');
    expect(result.stdout).not.toContain('secret123');
    expect(result.stdout).toContain('[REDACTED]');
  });
});