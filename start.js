const { spawn } = require('child_process');
const path = require('path');

// Function to run command in specific directory
function runCommand(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    console.error(`Error starting ${command}: ${error.message}`);
  });

  return child;
}

// Start Backend
console.log('Starting backend server...');
const backendPath = path.join(__dirname, 'backend');
const backend = runCommand('node', ['server.js'], backendPath);

// Wait a bit for backend to start
setTimeout(() => {
  // Start Frontend
  console.log('Starting frontend development server...');
  const clientPath = path.join(__dirname, 'client');
  const frontend = runCommand('npm', ['start'], clientPath);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 3000);

console.log('Press Ctrl+C to stop both servers'); 