const { spawn } = require('node:child_process');
const path = require('node:path');

const [command = 'open', ...args] = process.argv.slice(2);
if (!['open', 'run'].includes(command)) {
  console.error('Usage: node scripts/cypress.js <open|run> [Cypress options]');
  process.exit(2);
}

const cli = path.resolve(__dirname, '..', 'node_modules', 'cypress', 'bin', 'cypress');
const childEnv = { ...process.env };
delete childEnv.ELECTRON_RUN_AS_NODE;

const child = spawn(process.execPath, [cli, command, ...args], {
  cwd: path.resolve(__dirname, '..'),
  env: childEnv,
  stdio: 'inherit',
  windowsHide: false
});

child.on('error', error => {
  console.error(`Could not launch Cypress: ${error.message}`);
  process.exitCode = 1;
});
child.on('close', (code, signal) => {
  if (signal) {
    console.error(`Cypress stopped after ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
