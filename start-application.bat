@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH.
  echo Install Node.js, then open a new terminal and try again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 goto :error
)

echo Starting the backend and frontend together...
echo When Vite says it is ready, open http://127.0.0.1:5173
echo Leave this window open while you use the dashboard.
call npm.cmd run dev
if errorlevel 1 goto :error
exit /b 0

:error
echo.
echo The application stopped because of an error.
echo If a port is already in use, close the other project window and try again.
pause
exit /b 1
