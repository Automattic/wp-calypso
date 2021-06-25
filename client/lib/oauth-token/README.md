# OAuthToken

Wrapper for OAuth token storage so we can change the underlying storage location without changing access to the token.

Currently uses cookies so they are stored securely on-disk.

## Usage

OAuthToken.getToken()

OAuthToken.setToken( token );

OAuthToken.clearToken();
