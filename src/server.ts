import * as http from 'http';
import { WindowsCommandMCP } from './WindowsCommandMCP';

const PORT = process.env.PORT || 3000;
const mcp = new WindowsCommandMCP();

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  try {
    // Parse request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    await new Promise<void>((resolve) => {
      req.on('end', () => {
        resolve();
      });
    });

    const { command, type } = JSON.parse(body);

    let result;
    switch (type) {
      case 'execute':
        result = await mcp.execute_command(command);
        break;
      case 'cd':
        await mcp.change_directory(command);
        result = { status: 0, stdout: `Changed directory to ${mcp.get_current_directory()}`, stderr: '' };
        break;
      default:
        throw new Error(`Unknown command type: ${type}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));

  } catch (error) {
    console.error('Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Windows Command MCP server running on port ${PORT}`);
});
