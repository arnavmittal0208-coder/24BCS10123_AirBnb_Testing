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

echo Starting the Airbnb Testing Suite frontend on port 5173...
echo Dashboard: http://127.0.0.1:5173
call npm.cmd run client
if errorlevel 1 goto :error
exit /b 0

:error
echo.
echo Frontend stopped because of an error. Check the message above.
pause
exit /b 1
