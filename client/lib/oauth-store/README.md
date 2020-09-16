# OAuth Store

A flux store to provide the data needed for the OAuth login page.

## Data

This module exposes four pieces of data and emits a `change` event when any of them are changed:

- `requires2fa` - the login requires a two-factor authentication code
- `inProgress` - login request is underway to the API
- `errorLevel` - an error code associated with the last request
- `errorMessage` - a user-visible error message associated with the last request

## Actions

The action methods include:

- `login( username, password, auth_code )` - Issue a login using the given `username` and `password`. The `auth_code` should only be provided if `requires2fa` indicates it is needed.
