import pytest
import os
from cmd_mcp import WindowsCommandMCP, CommandExecutionError, ValidationError

@pytest.fixture
def mcp():
    return WindowsCommandMCP()

def test_execute_valid_command(mcp):
    result = mcp.execute_command('echo Hello World')
    assert result['status'] == 0
    assert 'Hello World' in result['stdout']
    assert result['stderr'] == ''

def test_execute_invalid_command(mcp):
    with pytest.raises(CommandExecutionError):
        mcp.execute_command('invalid_command')

def test_restricted_command(mcp):
    with pytest.raises(ValidationError):
        mcp.execute_command('del something.txt')

def test_change_directory(mcp):
    current_dir = os.getcwd()
    parent_dir = os.path.dirname(current_dir)
    
    mcp.change_directory(parent_dir)
    assert mcp.current_directory == parent_dir

def test_restricted_path(mcp):
    with pytest.raises(ValidationError):
        mcp.change_directory('C:\\Windows\\System32')

def test_command_output_sanitization(mcp):
    result = mcp.execute_command('echo password=secret123')
    assert 'secret123' not in result['stdout']
    assert '[REDACTED]' in result['stdout']