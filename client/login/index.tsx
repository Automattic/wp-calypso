import React, { useState, useEffect } from 'react';
import { useLogin } from 'lib/login';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, isLoading, error: loginError } = useLogin();
  const location = useLocation();

  useEffect(() => {
    if (loginError) {
      setError(loginError.message);
    }
  }, [loginError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <br />
        <button type='submit' disabled={isLoading}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;