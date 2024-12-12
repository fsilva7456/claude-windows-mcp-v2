const http = require('http');

async function testMCP() {
  // Test echo command
  const echoTest = {
    type: 'execute',
    command: 'echo Hello from Windows Command MCP!'
  };

  // Test directory listing
  const dirTest = {
    type: 'execute',
    command: 'dir'
  };

  // Test changing directory
  const cdTest = {
    type: 'cd',
    command: '..'
  };

  // Execute tests
  console.log('Testing echo command:');
  await sendRequest(echoTest);

  console.log('\nTesting directory listing:');
  await sendRequest(dirTest);

  console.log('\nTesting directory change:');
  await sendRequest(cdTest);

  console.log('\nTesting directory listing after cd:');
  await sendRequest(dirTest);
}

async function sendRequest(data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response:', JSON.parse(data));
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

testMCP().catch(console.error);
