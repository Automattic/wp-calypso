/**
 * Returns whether source matches a WordPress mobile app.
 *
 * @returns {boolean} Whether source matches the ones used on the WordPress mobile apps.
 */
export default function isWpMobileApp( source ) {
	return /wp-(android|iphone)/.test( source );
}
