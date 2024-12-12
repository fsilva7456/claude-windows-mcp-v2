import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const app = express();
const port = process.env.PORT || 3000;

const execAsync = promisify(exec);

app.use(express.json());

app.post('/', async (req, res) => {
  const { type, command } = req.body;

  if (type === 'specification') {
    res.json({
      name: 'windows-cmd',
      version: '1.0.0',
      commands: {
        execute: {
          description: 'Execute a Windows command',
          parameters: {
            command: {
              type: 'string',
              description: 'The command to execute'
            }
          }
        }
      }
    });
    return;
  }

  if (type === 'execute') {
    try {
      const { stdout, stderr } = await execAsync(command);
      res.json({
        stdout,
        stderr,
        status: 0
      });
    } catch (error: any) {
      res.json({
        stdout: '',
        stderr: error.message,
        status: error.code || 1
      });
    }
  } else {
    res.json({
      error: `Unknown command type: ${type}`
    });
  }
});

app.listen(port, () => {
  console.log(`Windows Command MCP server running on port ${port}`);
});
