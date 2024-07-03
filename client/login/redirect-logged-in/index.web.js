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

export default function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		// force full page reload to avoid SSR hydration issues.
		// Redirect parameters should have higher priority.
		let url = context?.query?.redirect_to;
		if ( ! url || isExternalUrl( url ) ) {
			url = '/';
		}
		window.location = url;
		return;
	}

	next();
}
