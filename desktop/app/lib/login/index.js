/**
 * Tells whether a URL points to the regular login page.
 * This is useful in places where we need to send the user to the desktop app's
 * login page (/log-in/desktop), instead of the regular login page.
 * @param url string
 * @returns {boolean}
 */
function isNonDesktopLoginUrl( url ) {
	let path = '';
	try {
		const u = new URL( url );
		path = u.pathname.replace( u.search, '' );
	} catch ( e ) {
		return false;
	}
	return path === '/log-in' || path === '/log-in/';
}

module.exports = { isNonDesktopLoginUrl };
