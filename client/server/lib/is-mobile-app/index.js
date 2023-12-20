/**
 * Returns whether source matches a WordPress mobile app.
 * @param source string
 * @returns {boolean} Whether source matches the ones used on the WordPress mobile apps.
 */
export function isWpMobileApp( source ) {
	return /wp-(android|iphone)/.test( source );
}

/**
 * Returns whether user is using a WooCommerce mobile app.
 * @param source string
 * @returns {boolean} Whether source matches the ones used on the WooCommerce mobile apps.
 */
export function isWcMobileApp( source ) {
	return /wc-(android|iphone)/.test( source );
}
