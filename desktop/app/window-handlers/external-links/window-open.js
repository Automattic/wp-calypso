/**
 * Decides what to do with a request to open a new window (target="_blank" links, window.open()).
 * @param {string} url The URL the new window was requested for.
 * @param {string} targetURL The URL of the link last hovered in the main view.
 * @returns {{ action: 'allow' } | { action: 'deny', urlToLoad: string }}
 */
function resolveWindowOpen( url, targetURL ) {
	// If the URL trying to open a new window is the Google Social login link, allow new window to open
	if ( url.includes( 'https://accounts.google.com/o/oauth2/auth' ) ) {
		return { action: 'allow' };
	}
	// Check if the incoming URL is blank and if it is send to the targetURL instead
	const urlToLoad = url.includes( 'about:blank' ) || url === '' ? targetURL : url;
	return { action: 'deny', urlToLoad };
}

module.exports = { resolveWindowOpen };
