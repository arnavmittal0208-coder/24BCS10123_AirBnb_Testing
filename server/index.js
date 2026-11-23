const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const root = path.resolve(__dirname, '..');
const reportsDir = path.join(root, 'reports');
fs.mkdirSync(reportsDir, { recursive: true });
const historyFile = path.join(reportsDir, 'history.json');
let runs = [];
try {
  runs = JSON.parse(fs.readFileSync(historyFile, 'utf8')).map(({ child, ...run }) => run);
  runs.forEach(run => { if (run.status === 'running') run.status = 'interrupted'; });
} catch {}
let active = null;
const save = () => fs.writeFileSync(historyFile, JSON.stringify(runs.slice(0, 30), null, 2));

function cypress(args) {
  const cli = path.join(root, 'node_modules', 'cypress', 'bin', 'cypress');
  const childEnv = { ...process.env };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  const child = spawn(process.execPath, [cli, ...args], {
    cwd: root,
    env: childEnv,
    windowsHide: args[0] !== 'open',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  child.captureOutput = () => output;
  return child;
}

function finish(id, code, output, reportDir) {
  if (!active || active.id !== id) return;
  const run = runs.find(item => item.id === id);
  if (!run) return;
  if (reportDir) {
    try {
      const report = JSON.parse(fs.readFileSync(path.join(reportDir, 'mochawesome.json'), 'utf8'));
      run.summary = { total: report.stats?.tests || 0, passed: report.stats?.passes || 0, failed: report.stats?.failures || 0, pending: report.stats?.pending || 0, duration: report.stats?.duration || 0 };
      run.report = fs.existsSync(path.join(reportDir, 'report.html'));
    } catch { run.summary = null; }
  }
  run.status = code === 0 ? 'passed' : 'failed';
  run.completedAt = new Date().toISOString();
  run.duration = `${Math.round((Date.now() - new Date(run.startedAt).getTime()) / 1000)}s`;
  run.error = code === 0 ? null : output.slice(-1800);
  active = null;
  save();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function writeDetailedReport(reportDir) {
  const report = JSON.parse(fs.readFileSync(path.join(reportDir, 'mochawesome.json'), 'utf8'));
  const flatten = (suite, prefix = []) => [
    ...(suite.tests || []).map(test => ({ title: [...prefix, test.title].join(' > '), state: test.state, err: test.err?.message || '' })),
    ...(suite.suites || []).flatMap(child => flatten(child, [...prefix, child.title]))
  ];
  const cases = (report.results || []).flatMap(result => (result.suites || []).flatMap(suite => flatten(suite)));
  const rows = cases.map(test => `<tr><td>${escapeHtml(test.title)}</td><td class="${test.state === 'passed' ? 'pass' : 'fail'}">${escapeHtml(test.state || 'unknown')}</td><td>${escapeHtml(test.err)}</td></tr>`).join('');
  const stats = report.stats || {};
  fs.writeFileSync(path.join(reportDir, 'report.html'), `<!doctype html><meta charset="utf-8"><title>Airbnb E2E report</title><style>body{font:14px system-ui;margin:40px auto;max-width:1000px;color:#263446}h1{font-size:24px}table{width:100%;border-collapse:collapse}td,th{text-align:left;border-bottom:1px solid #e5e9ef;padding:10px}.pass{color:#328357}.fail{color:#bd554d}</style><h1>Airbnb E2E · Detailed report</h1><p>${stats.passes || 0} passed · ${stats.failures || 0} failed · ${stats.pending || 0} pending · ${stats.duration || 0} ms</p><table><thead><tr><th>Test case</th><th>Status</th><th>Failure details</th></tr></thead><tbody>${rows}</tbody></table>`);
}

app.get('/api/status', (_req, res) => {
  const latest = runs.find(run => run.summary)?.summary || null;
  res.json({ running: Boolean(active), mode: active?.mode || null, history: runs.slice(0, 12), summary: latest, logs: runs.flatMap(run => run.logs || []).slice(0, 40) });
});

app.post('/api/events', (req, res) => {
  if (!active || !Array.isArray(req.body?.events)) return res.status(202).json({ accepted: false });
  const events = req.body.events.slice(0, 100).map(event => ({
    title: String(event.title || '').slice(0, 240),
    state: ['passed', 'failed', 'pending'].includes(event.state) ? event.state : 'pending',
    duration: Number(event.duration) || 0,
    error: String(event.error || '').slice(0, 1200),
    spec: String(req.body.spec || '').slice(0, 160),
    completedAt: new Date().toISOString()
  }));
  active.logs = [...(active.logs || []), ...events].slice(-100);
  active.summary = active.logs.reduce((counts, event) => {
    counts.total++;
    counts[event.state]++;
    return counts;
  }, { total: 0, passed: 0, failed: 0, pending: 0 });
  save();
  res.json({ accepted: true });
});

app.post('/api/run/:mode', (req, res) => {
  const mode = req.params.mode;
  if (!['e2e', 'run'].includes(mode)) return res.status(404).json({ error: 'Unknown run mode.' });
  if (active) return res.status(409).json({ error: 'A Cypress execution is already running.' });
  const id = randomUUID();
  const run = { id, mode, status: 'running', startedAt: new Date().toISOString(), report: false };
  runs.unshift(run);
  active = run;
  save();

  const reportDir = path.join(reportsDir, id);
  fs.mkdirSync(reportDir, { recursive: true });
  const options = `reportDir=${reportDir},overwrite=true,html=true,json=true,quiet=true`;
  const args = ['run', '--e2e', '--browser', 'chrome'];
  if (mode === 'e2e') args.push('--headed');
  args.push('--reporter', 'mochawesome', '--reporter-options', options);
  const child = cypress(args);
  child.on('close', code => {
    if (!active || active.id !== id) return;
    try { writeDetailedReport(reportDir); } catch {}
    finish(id, code, child.captureOutput(), reportDir);
  });
  res.status(202).json({ id, status: 'running' });
});

app.get('/api/report/latest', (_req, res) => {
  const run = runs.find(item => item.report);
  if (!run) return res.status(404).send('No detailed report yet. Run the E2E suite first.');
  res.redirect(`/api/report/${run.id}`);
});
app.get('/api/report/:id', (req, res) => {
  if (!runs.some(run => run.id === req.params.id)) return res.status(404).send('Report is not available for this run.');
  const file = path.join(reportsDir, req.params.id, 'report.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  return res.status(404).send('Report is not available for this run.');
});

const port = Number(process.env.PORT) || 4174;
app.listen(port, () => console.log(`Dashboard API listening on http://localhost:${port}`));
