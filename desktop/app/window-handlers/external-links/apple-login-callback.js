/**
 * Whether a redirect goes to the Sign in with Apple callback on WordPress.com.
 * @param {string} url The URL being redirected to.
 * @returns {boolean}
 */
function isAppleLoginCallback( url ) {
	try {
		const { origin, pathname } = new URL( url );
		return (
			origin === 'https://wordpress.com' && /^\/log-in\/apple\/callback(\/|$)/.test( pathname )
		);
	} catch {
		return false;
	}
}

module.exports = { isAppleLoginCallback };
