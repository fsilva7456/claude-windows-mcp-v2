import * as http from 'http';
import { WindowsCommandMCP } from './WindowsCommandMCP';

interface CommandRequest {
  type: 'execute' | 'cd';
  command: string;
}

const PORT = process.env.PORT || 3000;
const mcp = new WindowsCommandMCP();

const server = http.createServer(async (req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);

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
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    console.log('Received data:', data);

    const request = JSON.parse(data) as CommandRequest;
    console.log('Parsed request:', request);

    let result;
    switch (request.type) {
      case 'execute':
        console.log('Executing command:', request.command);
        result = await mcp.execute_command(request.command);
        break;
      case 'cd':
        console.log('Changing directory to:', request.command);
        await mcp.change_directory(request.command);
        result = { 
          status: 0, 
          stdout: `Changed directory to ${mcp.get_current_directory()}`, 
          stderr: '' 
        };
        break;
      default:
        throw new Error(`Unknown command type: ${request.type}`);
    }

    console.log('Command result:', result);
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
