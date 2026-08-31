/**
 * Where the login flow is allowed to send someone.
 *
 * Both the logged-in route middleware and the post-login reboot need this, and
 * they must agree: whichever one is looser would otherwise be a way around the
 * other.
 */

const ALLOWED_HOSTNAMES = [ 'wordpress.com', 'subscribe.wordpress.com', 'agencies.automattic.com' ];

// A nested redirect is only unwrapped when it sits on a login page we serve.
const LOGIN_PATH_PREFIX = '/log-in';

// More hops than any real flow needs. The bound is only here so that a
// self-referencing redirect cannot spin.
const MAX_UNWRAP_HOPS = 5;

/**
 * For this context, we consider external URLs that are NOT:
 * - Relative paths (`/test`)
 * - Absolute URLs on https://wordpress.com/*
 * @param {string} url URL to check
 * @returns {boolean}
 */
export function isExternalUrl( url: string ): boolean {
	if ( url.startsWith( '/' ) ) {
		return false;
	}

	try {
		const urlObject = new URL( url );

		if ( ALLOWED_HOSTNAMES.includes( urlObject.hostname ) && urlObject.protocol === 'https:' ) {
			return false;
		}
	} catch {
		return true;
	}

	return true;
}

/**
 * For internal urls check when parsed the origin
 * @param {string} url URL to check
 * @returns {boolean}
 */
export function isUnsafeInternalUrl( url: string ): boolean {
	if ( ! url.startsWith( '/' ) ) {
		return false;
	}

	try {
		return new URL( url, window.location.origin ).origin !== window.location.origin;
	} catch ( e ) {
		return true;
	}
}

/**
 * Whether the login flow may send someone to this URL.
 * @param {string} url URL to check
 * @returns {boolean}
 */
export function isSafeLoginRedirect( url: string | null | undefined ): boolean {
	if ( ! url ) {
		return false;
	}

	return ! isUnsafeInternalUrl( url ) && ! isExternalUrl( url );
}

/**
 * Whether this URL is one of our own login pages.
 * @param {URL} parsed Parsed URL.
 * @returns {boolean}
 */
function isOwnLoginPage( parsed: URL ): boolean {
	if ( ! parsed.pathname.startsWith( LOGIN_PATH_PREFIX ) ) {
		return false;
	}

	// Same origin covers production; the explicit hostname keeps this working
	// when Calypso is served from somewhere else, such as a calypso.live branch.
	return parsed.origin === window.location.origin || parsed.hostname === 'wordpress.com';
}

/**
 * Works out where to send someone whose login has just succeeded.
 *
 * Almost always this is the redirect we were handed, returned untouched. The
 * exception is a redirect that points back at `/log-in`: the login has already
 * succeeded, so that page is the one place the person must not end up.
 * Passwordless accounts cannot get past it at all, which turns it into a loop
 * they never escape (DOTOBRD-359).
 *
 * The destination they were originally heading for is usually still there in
 * the login URL's own `redirect_to`, so prefer it over dropping them on the
 * dashboard. That nested value has to pass isSafeLoginRedirect() on its own —
 * the outer URL having been allowed says nothing about what was in its query
 * string.
 * @param {string} redirectTo The sanitized redirect handed to us after login.
 * @returns {string | null} Where to go, or null to fall back to the dashboard.
 */
export function resolvePostLoginRedirect( redirectTo: string | null | undefined ): string | null {
	if ( ! redirectTo ) {
		return null;
	}

	let current = redirectTo;

	for ( let hop = 0; hop < MAX_UNWRAP_HOPS; hop++ ) {
		let parsed;
		try {
			parsed = new URL( current, window.location.origin );
		} catch {
			return null;
		}

		if ( ! isOwnLoginPage( parsed ) ) {
			// An ordinary destination. Hand it back exactly as it came in, so
			// flows that rely on their own hosts keep working.
			return current;
		}

		const nested = parsed.searchParams.get( 'redirect_to' );

		if ( ! isSafeLoginRedirect( nested ) ) {
			return null;
		}

		current = nested as string;
	}

	return null;
}

/**
 * Whether the redirect handed to us after login points back at the login page.
 * @param {string} redirectTo The sanitized redirect handed to us after login.
 * @returns {boolean}
 */
export function pointsAtLoginPage( redirectTo: string | null | undefined ): boolean {
	if ( ! redirectTo ) {
		return false;
	}

	try {
		return isOwnLoginPage( new URL( redirectTo, window.location.origin ) );
	} catch {
		return false;
	}
}
