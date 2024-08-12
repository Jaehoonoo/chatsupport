"use client";

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase';
import { db } from "@/firebase"; 
import { doc, setDoc } from 'firebase/firestore';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false); 
  const [isLoginHovered, setIsLoginHovered] = useState(false); 

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email
      });

      window.location.href = '/'; 
    } catch (error) {
      setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.box}>
        <h2 style={styles.title}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            style={styles.input}
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
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
            style={isHovered ? { ...styles.button, ...styles.buttonHover } : styles.button} 
            type="submit"
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)} 
          >
            Sign Up
          </button>
        </form>
        <p style={styles.signupText}>
          Already have an account?&nbsp;
          <a 
            href="/login" 
            style={isLoginHovered ? { ...styles.signupLink, ...styles.signupLinkHover } : styles.signupLink}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
          >
            Login
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
    textDecoration: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: '15px',
  },
};