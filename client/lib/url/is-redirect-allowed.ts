/**
 * Return false for absolute URLs which are on unknown hosts.
 *
 * Because the `redirectTo` query param on the pending page is the target of
 * that page's redirect, we want to make sure we do not create an open redirect
 * security hole that could go anywhere. This function will disallow a URL
 * which is absolute and on an unknown host.
 */

// TODO: Replace original implementation of isRedirectAllowed with a reference to this shared module
export function isRedirectAllowed( url: string ): boolean {
	if ( url.startsWith( '/' ) ) {
		return true;
	}

	const allowedHostsForRedirect = [
		'wordpress.com',
		'wpcalypso.wordpress.com',
		'horizon.wordpress.com',
		'calypso.localhost',
		'jetpack.cloud.localhost',
		'cloud.jetpack.com',
		'jetpack.com',
		'akismet.com',
	];

	try {
		const parsedUrl = new URL( url );
		const { hostname } = parsedUrl;
		if ( ! hostname ) {
			return false;
		}

		// Return true for *.calypso.live urls.
		if ( /^([a-zA-Z0-9-]+\.)?calypso\.live$/.test( hostname ) ) {
			return true;
		}

		if ( ! allowedHostsForRedirect.includes( hostname ) ) {
			return false;
		}

		return true;
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( `Redirecting to absolute url '${ url }' failed:`, err );
	}
	return false;
}
