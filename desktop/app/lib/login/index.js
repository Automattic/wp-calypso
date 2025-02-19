/**
 * Tells whether a URL points to the regular login page.
 * This is useful in places where we need to send the user to the desktop app's
 * login page (/log-in/desktop), instead of the regular login page.
 * @param url string
 * @returns {boolean}
 */
function isNonDesktopLoginUrl( url ) {
	const u = new URL( url );
	const path = u.pathname.replace( u.search, '' );
	return path === '/log-in' || path === '/log-in/';
}

module.exports = { isNonDesktopLoginUrl };
