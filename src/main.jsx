import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard.jsx';
import './styles.css';
import './logs.css';

createRoot(document.getElementById('root')).render(<Dashboard />);
