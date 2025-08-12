# API

This directory contains API endpoints for the Node.js server that supplements the Calypso application. While most of the application uses the external WordPress.com API, this server is responsible for handling a few specific behaviors.

## Available Endpoints

### Sign in with Apple

The following endpoints are available behind the `sign-in-with-apple/redirect` feature flag:

- **POST `/log-in/apple/callback`**
- **POST `/start/user`**
- **POST `/me/security/social-login`**

These endpoints manage the authentication flow with Apple's services, including token validation, user data processing, and redirection back to Calypso after successful authentication.
