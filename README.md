# Claude Windows Command Prompt MCP

A Model Context Protocol (MCP) implementation that enables Claude to interact with the Windows Command Prompt.

## Overview

This MCP implementation allows Claude to execute commands in the Windows Command Prompt and receive their output. It includes safety measures and validation to ensure secure command execution.

## Features

- Execute Windows Command Prompt commands
- Receive command output
- Command validation and sanitization
- Error handling
- Configurable command restrictions

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```python
from cmd_mcp import WindowsCommandMCP

# Initialize the MCP
mcp = WindowsCommandMCP()

# Execute a command
result = mcp.execute_command('dir')
print(result)
```

## Security

- Commands are validated against a whitelist
- Restricted commands and directories are blocked
- Output is sanitized before return

## Testing

```bash
python -m pytest tests/
```

## License

MIT License