/**
 * Decides what to do with a request to open a new window (target="_blank" links, window.open()).
 * @param {string} url The URL the new window was requested for.
 * @param {string} targetURL The URL of the link last hovered in the main view.
 * @returns {{ action: 'allow' } | { action: 'deny', urlToLoad: string }}
 */
function resolveWindowOpen( url, targetURL ) {
	// If the URL trying to open a new window is the Google Social login link, allow new window to open
	if ( isUrlUnder( url, 'https://accounts.google.com', '/o/oauth2/auth' ) ) {
		return { action: 'allow' };
	}
	// Check if the incoming URL is blank and if it is send to the targetURL instead
	const urlToLoad = url.includes( 'about:blank' ) || url === '' ? targetURL : url;
	return { action: 'deny', urlToLoad };
}

/**
 * Whether a URL is on the given origin and its path starts with the given prefix.
 * @param {string} url
 * @param {string} origin e.g. 'https://wordpress.com'
 * @param {string} pathPrefix e.g. '/log-in/apple/callback'
 * @returns {boolean}
 */
function isUrlUnder( url, origin, pathPrefix ) {
	try {
		const parsed = new URL( url );
		return parsed.origin === origin && parsed.pathname.startsWith( pathPrefix );
	} catch {
		return false;
	}
}

module.exports = { resolveWindowOpen, isUrlUnder };
