/**
 * OAuth2 Client IDs
 * These map to registered OAuth2 applications in the WordPress.com system.
 */
export const OAUTH2_CLIENT_IDS = {
	// Studio by WordPress.com
	STUDIO: 95109,

	// Gravatar
	GRAVATAR: 1854,
} as const;

/**
 * OAuth2 Signup Flow
 * WordPress.com Connect signup flow name used for OAuth2 client registrations
 */
export const OAUTH2_SIGNUP_FLOW = 'wpcc';
