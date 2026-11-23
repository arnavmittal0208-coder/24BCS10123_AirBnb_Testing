const { defineConfig } = require('cypress');
const dotenv = require('dotenv');
dotenv.config();

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.airbnb.co.in',
    testIsolation: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      on('after:spec', async (spec, results) => {
        if (!results) return;
        const events = (results.tests || []).map(test => ({
          title: [...(test.title || [])].join(' > '),
          state: test.state || 'pending',
          duration: test.attempts?.reduce((n, attempt) => n + (attempt.duration || 0), 0) || 0,
          error: test.displayError || ''
        }));
        await fetch(`http://127.0.0.1:${process.env.PORT || 4174}/api/events`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ spec: spec.relative, events })
        }).catch(() => {});
      });
      return config;
    }
  },
  reporter: 'mochawesome',
  reporterOptions: { reportDir: 'reports/mochawesome', overwrite: true, html: true, json: true, quiet: true },
  env: { hideCredentials: true }
});
