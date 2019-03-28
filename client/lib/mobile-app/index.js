/** @format **/

/**
 * Returns whether user is using a mobile app.
 *
 * @returns {Boolean} Whether the user agent matches the ones used on the mobile apps.
 */
export function isMobileApp() {
	return navigator && /wp-(android|iphone)/.test( navigator.userAgent );
}
