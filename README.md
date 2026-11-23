# Airbnb Testing Suite

An end-to-end testing dashboard for Airbnb that combines a React interface, an Express API, and Cypress automation. The suite runs 12 browser test cases against Airbnb's India domain (`airbnb.co.in`) and reports each result in the dashboard.

The tests cover public browsing flows and do not sign in, make bookings, or process payments.

## Features

- Dashboard for starting headed or headless Cypress runs
- Live test status and execution history
- Mochawesome JSON and HTML reports
- Detailed pass/fail results and failure messages
- Automatic protection against concurrent test executions
- Browser isolation disabled so shared disclosure dialogs remain stable between cases
- Windows batch scripts for starting the application and individual services

## Tech Stack

- React 18
- Vite 6
- Express 4
- Cypress 14
- Mochawesome
- Node.js
- HTML and CSS

## Project Structure

```text
.
├── cypress/
│   ├── e2e/                 # End-to-end specifications
│   └── support/             # Cypress custom commands and setup
├── scripts/                 # Cypress launch helper
├── server/                  # Express dashboard API
├── src/                     # React dashboard source
├── cypress.config.js        # Cypress configuration
├── package.json             # Scripts and dependencies
└── vite.config.js           # Vite and API proxy configuration
```

## Prerequisites

- Node.js 20 or newer
- npm
- Google Chrome
- Internet access to `https://www.airbnb.co.in`

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file if you need to change the API port:

```bash
copy .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4174` | Port used by the Express dashboard API |

Keep `.env` files and credentials out of Git. Only `.env.example` should be committed.

## Run the Application

Start both the React frontend and Express backend:

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

On Windows, you can instead double-click:

- `start-application.bat` to start both services
- `start-backend.bat` for the API only
- `start-frontend.bat` for the React dashboard only

## Run Cypress Tests

Open the headed Cypress runner:

```bash
npm run cypress:open
```

Run the complete suite headlessly in Chrome:

```bash
npm run cypress:run
```

Generated screenshots, videos, and reports are excluded from Git.

## Build

Create a production build of the dashboard:

```bash
npm run build
```

The build output is written to `dist/`.

## Notes

Airbnb may change its interface or restrict automated traffic. In those cases, test failures indicate that live-page behavior no longer matches the automation selectors or that the site blocked access. This project is for learning and testing purposes and should be used responsibly and in accordance with Airbnb's terms.
