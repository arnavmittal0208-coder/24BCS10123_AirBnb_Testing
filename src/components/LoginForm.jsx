import React from 'react';
export function LoginForm({ onSubmit = () => {} }) {
  return <form onSubmit={e => { e.preventDefault(); onSubmit(); }}><label>Email<input aria-label="Email" type="email" required /></label><label>Password<input aria-label="Password" type="password" required minLength={8} /></label><button type="submit">Continue</button></form>;
}
