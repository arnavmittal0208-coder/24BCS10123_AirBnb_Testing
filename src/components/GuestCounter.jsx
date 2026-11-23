import React from 'react';
export function GuestCounter({ count, onChange }) {
  return <div className="counter"><button aria-label="Decrease guests" onClick={() => onChange(Math.max(1, count - 1))}>−</button><span aria-label="Guest count">{count}</span><button aria-label="Increase guests" onClick={() => onChange(count + 1)}>+</button></div>;
}
