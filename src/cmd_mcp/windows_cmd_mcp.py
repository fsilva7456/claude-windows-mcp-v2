import subprocess
import os
import re
from typing import Optional, Dict, List

class CommandExecutionError(Exception):
    """Raised when command execution fails."""
    pass

class ValidationError(Exception):
    """Raised when command or path validation fails."""
    pass

class WindowsCommandMCP:
    """Windows Command Prompt Model Context Protocol implementation."""

    RESTRICTED_COMMANDS = [
        'format',
        'del',
        'rm',
        'rmdir',
        'rd',
        'reg',
        'regedit',
        'attrib',
        'cacls'
    ]

    RESTRICTED_PATHS = [
        'C:\\Windows\\System32',
        'C:\\Windows\\System',
        'C:\\Windows'
    ]

    def __init__(self, config: Optional[Dict] = None):
        """Initialize the Windows Command MCP.

        Args:
            config (Optional[Dict]): Configuration dictionary for customizing behavior
        """
        self.config = config or {}
        self.current_directory = os.getcwd()
        self.restricted_commands = (
            self.config.get('restricted_commands', []) +
            self.RESTRICTED_COMMANDS
        )
        self.restricted_paths = (
            self.config.get('restricted_paths', []) +
            self.RESTRICTED_PATHS
        )

    def validate_command(self, command: str) -> None:
        """Validate a command for security.

        Args:
            command (str): Command to validate

        Raises:
            ValidationError: If command is restricted or invalid
        """
        command_parts = command.lower().split()
        if not command_parts:
            raise ValidationError('Empty command')

        base_command = command_parts[0]

        # Check against restricted commands
        if base_command in self.restricted_commands:
            raise ValidationError(f'Command {base_command} is restricted')

        # Check for dangerous characters
        dangerous_chars = ['|', '>', '<', '&', ';']
        if any(char in command for char in dangerous_chars):
            raise ValidationError('Command contains restricted characters')

    def validate_path(self, path: str) -> None:
        """Validate a file system path.

        Args:
            path (str): Path to validate

        Raises:
            ValidationError: If path is restricted or invalid
        """
        abs_path = os.path.abspath(path)

        # Check against restricted paths
        for restricted in self.restricted_paths:
            if abs_path.lower().startswith(restricted.lower()):
                raise ValidationError(f'Access to path {abs_path} is restricted')

        # Check if path exists
        if not os.path.exists(abs_path):
            raise ValidationError(f'Path {abs_path} does not exist')

    def execute_command(self, command: str) -> Dict:
        """Execute a command in Windows Command Prompt.

        Args:
            command (str): The command to execute

        Returns:
            Dict: Command execution results containing stdout, stderr, and status

        Raises:
            CommandExecutionError: If command execution fails
            ValidationError: If command fails validation
        """
        try:
            # Validate the command
            self.validate_command(command)

            # Execute command
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True,
                cwd=self.current_directory,
                text=True
            )

            # Get output
            stdout, stderr = process.communicate()
            status = process.returncode

            # Sanitize output
            stdout = self._sanitize_output(stdout)
            stderr = self._sanitize_output(stderr)

            return {
                'stdout': stdout,
                'stderr': stderr,
                'status': status
            }

        except subprocess.SubprocessError as e:
            raise CommandExecutionError(f'Command execution failed: {str(e)}')

    def _sanitize_output(self, output: str) -> str:
        """Sanitize command output.

        Args:
            output (str): Raw command output

        Returns:
            str: Sanitized output
        """
        if not output:
            return ''

        # Remove sensitive information patterns
        patterns = [
            r'(?i)password[s]?[=:].+',
            r'(?i)secret[s]?[=:].+',
            r'(?i)token[s]?[=:].+'
        ]

        sanitized = output
        for pattern in patterns:
            sanitized = re.sub(pattern, '[REDACTED]', sanitized)

        return sanitized

    def change_directory(self, path: str) -> None:
        """Change the current working directory.

        Args:
            path (str): New directory path

        Raises:
            ValidationError: If path is invalid or restricted
        """
        abs_path = os.path.abspath(path)
        self.validate_path(abs_path)
        self.current_directory = abs_path