import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

/**
 * For this context, we consider external URLs that are NOT:
 * - Relative paths (`/test`)
 * - Absolute URLs on https://wordpress.com/*
 * @param {string} url URL to check
 * @returns {boolean}
 */
function isExternalUrl( url ) {
	if ( url.startsWith( '/' ) ) {
		return false;
	}

	try {
		const urlObject = new URL( url );
		const allowedHostname = [
			'wordpress.com',
			'subscribe.wordpress.com',
			'agencies.automattic.com',
		];

		if ( allowedHostname.includes( urlObject.hostname ) && urlObject.protocol === 'https:' ) {
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
function isUnsafeInternalUrl( url ) {
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
 * The wordpress.com root is the marketing homepage, not a useful post-login
 * destination, so treat it as "send me to my dashboard". Other allowed hosts
 * keep their own root.
 * @param {string} url URL to check
 * @returns {boolean}
 */
function isBareRoot( url ) {
	try {
		const parsed = new URL( url, window.location.origin );
		return (
			parsed.pathname === '/' && ( url.startsWith( '/' ) || parsed.hostname === 'wordpress.com' )
		);
	} catch {
		return false;
	}
}

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		// Redirect parameters should have higher priority.
		let url = context?.query?.redirect_to;
		if ( ! url || isBareRoot( url ) || isUnsafeInternalUrl( url ) || isExternalUrl( url ) ) {
			url = '/home';
		}
		window.location = url;
		return;
	}

	next();
}
