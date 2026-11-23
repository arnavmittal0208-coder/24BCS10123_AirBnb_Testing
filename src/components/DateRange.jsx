import React from 'react';
export function isValidDateRange(checkIn, checkOut) { return Boolean(checkIn && checkOut && new Date(checkOut) > new Date(checkIn)); }
export function DateRange({ checkIn, checkOut, onChange }) {
  return <div className="date-fields"><label>Check-in<input aria-label="Check-in" type="date" value={checkIn} onChange={e => onChange({ checkIn: e.target.value, checkOut })} /></label><label>Check-out<input aria-label="Check-out" type="date" value={checkOut} onChange={e => onChange({ checkIn, checkOut: e.target.value })} /></label></div>;
}
