"use client";

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isSignupHovered, setIsSignupHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/';
    } catch (error) {
      setError('Failed to sign in. Wrong email or password.');
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.box}>
          <button
            style={isBackHovered ? { ...styles.back, ...styles.backHover } : styles.back} 
            type="submit"
            onMouseEnter={() => setIsBackHovered(true)} 
            onMouseLeave={() => setIsBackHovered(false)} 
            onClick={handleBack}
          >
            Back
          </button>
        <h2 style={styles.title}>Login Form</h2>
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="email"
            placeholder="johndoe@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button
            style={isLoginHovered ? { ...styles.button, ...styles.buttonHover } : styles.button} 
            type="submit"
            onMouseEnter={() => setIsLoginHovered(true)} 
            onMouseLeave={() => setIsLoginHovered(false)} 
          >
            Login
          </button>
        </form>
        <p style={styles.signupText}>
          Don&apos;t have an account?&nbsp;
          <a 
            href="/signup" 
            style={isSignupHovered ? { ...styles.signupLink, ...styles.signupLinkHover } : styles.signupLink}
            onMouseEnter = {() => setIsSignupHovered(true)}
            onMouseLeave = {() => setIsSignupHovered(false)}
          >
            Signup Now
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundImage: 'url("/images/background.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  box: {
    position: 'relative',
    zIndex: 2,
    padding: '40px',
    width: '320px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    height: 'auto',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2f4f3f',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#1e2d27', 
    transform: 'scale(1.05)', 
  },
  signupText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#999',
  },
  signupLink: {
    color: '#c3c78e',
    textDecoration: 'none',
  },
  signupLinkHover: {
    color: '#a3a37a',
    textDecoration: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: '15px',
  },
  back: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    padding: '11px',
    backgroundColor: '#2f4f3f',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  backHover: {
    backgroundColor: '#1e2d27',
    transform: 'scale(1.05)',
  },
};