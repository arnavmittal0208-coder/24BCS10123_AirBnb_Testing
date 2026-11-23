import React from 'react';
export function formatPrice(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value); }
export function PropertyCard({ title, location, price, image }) {
  return <article className="property-card"><img src={image} alt={title} /><h3>{title}</h3><p>{location}</p><strong>{formatPrice(price)} <span>/ night</span></strong></article>;
}
