from cmd_mcp import WindowsCommandMCP, CommandExecutionError, ValidationError

def main():
    # Initialize the MCP
    mcp = WindowsCommandMCP()

    try:
        # Execute a simple command
        result = mcp.execute_command('echo Hello from Windows Command Prompt!')
        print('Command output:', result['stdout'])

        # List directory contents
        result = mcp.execute_command('dir')
        print('\nDirectory contents:')
        print(result['stdout'])

        # Try changing directory
        mcp.change_directory('..')
        print('\nChanged to parent directory')

        # List contents in new directory
        result = mcp.execute_command('dir')
        print('New directory contents:')
        print(result['stdout'])

    except ValidationError as e:
        print(f'Validation error: {e}')
    except CommandExecutionError as e:
        print(f'Execution error: {e}')

if __name__ == '__main__':
    main()
