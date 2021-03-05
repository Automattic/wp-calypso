/**
 * Returns whether user is using a WordPress mobile app.
 *
 * @returns {boolean} Whether the user agent matches the ones used on the WordPress mobile apps.
 */
export function isWpMobileApp() {
	if ( typeof navigator === 'undefined' ) {
		return false;
	}
	return navigator.userAgent && /wp-(android|iphone)/.test( navigator.userAgent );
}
