# API

This directory contains API endpoints for the Node.js server that supplements the Calypso application. While most of the application uses the external WordPress.com API, this server is responsible for handling a few specific behaviors.

## Available Endpoints

### Sign in with Apple

The following endpoints are available behind the `sign-in-with-apple/redirect` feature flag:

- **POST `/log-in/apple/callback`**
- **POST `/start/user`**
- **POST `/me/security/social-login`**

These endpoints manage the authentication flow with Apple's services, including token validation, user data processing, and redirection back to Calypso after successful authentication.

### SSO Bridge

- **GET `/sso-bridge`**

Server-side broker for Jetpack SSO on OAuth-powered MSD instances (e.g., `my.woo.ai`). When a user visits a site's wp-admin, Jetpack SSO redirects to `/sso-bridge?site_id=X&sso_nonce=Y`. This endpoint reads the `wpcom_token` OAuth cookie, calls the wpcom `sso-authorize` API, and redirects to the resulting login URL. If the user has no token yet, it falls through to the client which triggers the login/OAuth flow first. On any error, it redirects to `/sso-bridge?sso_error=failed` where the SPA renders an error page.
