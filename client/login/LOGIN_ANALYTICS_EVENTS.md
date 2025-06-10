# Login Analytics Events

This document outlines all the analytics events tracked during the login process, particularly for magic login flows.

## Magic Login Authentication Events

### `calypso_login_magic_authenticate_attempt`
**Description**: Tracks when a magic login authentication is attempted (either code or link)

**Properties**:
- `flow` (string|null): The client's login flow (e.g., gravatar flows)
- `token_type` (string): Either "code" or "link"

### `calypso_login_magic_authenticate_success`
**Description**: Tracks successful magic login authentication

**Properties**:
- `flow` (string|null): The client's login flow
- `token_type` (string): Either "code" or "link"

### `calypso_login_magic_authenticate_failure`
**Description**: Tracks failed magic login authentication attempts

**Properties**:
- `flow` (string|null): The client's login flow
- `token_type` (string): Either "code" or "link"
- `error_code` (number): HTTP status code of the error
- `error_message` (string): Error type/message

## Magic Code Verification Events

### `calypso_login_magic_code_submit`
**Description**: Tracks when user submits a magic code for verification

**Properties**:
- `code_length` (number): Length of the submitted verification code

## Email Link Events

### `calypso_login_email_link_submit`
**Description**: Tracks when user requests a magic login email

**Properties**:
- `flow` (string|null): The client's login flow
- `token_type` (string): Token type being requested

### `calypso_login_email_link_success`
**Description**: Tracks successful email link request

**Properties**:
- `flow` (string|null): The client's login flow
- `token_type` (string): Token type that was requested

### `calypso_login_email_link_failure`
**Description**: Tracks failed email link requests

**Properties**:
- `flow` (string|null): The client's login flow
- `token_type` (string): Token type that was requested
- `error_code` (string): Error code from the API
- `error_message` (string): Error message from the API

### `calypso_login_email_link_handle_click_view`
**Description**: Tracks when user views the email link handling page

**Properties**: None

## General Login Events

### `calypso_login_success`
**Description**: Tracks overall successful login completion

**Properties**:
- `is_jetpack` (boolean): Whether this is a Jetpack login
- `is_magic_login` (boolean): Whether magic login was used
- `login_method` (string): The method used for login

## Event Flow

1. **Email Request**: `calypso_login_email_link_submit` → `calypso_login_email_link_success`/`calypso_login_email_link_failure`
2. **Link Click**: `calypso_login_email_link_handle_click_view`
3. **Code Entry** (if applicable): `calypso_login_magic_code_submit`
4. **Authentication**: `calypso_login_magic_authenticate_attempt` → `calypso_login_magic_authenticate_success`/`calypso_login_magic_authenticate_failure`
5. **Final Success**: `calypso_login_success`

## Implementation Files

- **Email requests**: `client/state/data-layer/wpcom/auth/send-login-email/index.js`
- **Authentication**: `client/state/login/magic-login/actions.js`
- **Code verification**: `client/login/magic-login/verify-login-code.jsx`
- **Final login**: `client/state/login/actions/reboot-after-login.ts` 