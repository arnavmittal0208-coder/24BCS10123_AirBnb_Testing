import React from 'react';
export function DestinationSearch({ value, onChange }) {
  return <label className="field-label">Destination<input aria-label="Destination" value={value} onChange={e => onChange(e.target.value)} placeholder="Where are you going?" /></label>;
}
