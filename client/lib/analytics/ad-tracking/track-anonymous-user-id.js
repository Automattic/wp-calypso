import cookie from 'cookie';

// Ensure setup has run.
import './setup';

/**
 * Returns the anoymous id stored in the `tk_ai` cookie
 * @returns {string} - The Tracks anonymous user id
 */
export function tracksAnonymousUserId() {
	const cookies = cookie.parse( document.cookie );
	return cookies.tk_ai;
}
