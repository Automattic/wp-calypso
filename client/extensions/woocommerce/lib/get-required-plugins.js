/** @format */

/**
 * Get the list of plugins required to use Store on WP.com
 * @return {Array} List of plugin slugs
 */
export function getRequiredPluginsForCalypso() {
	return [ 'woocommerce', 'woocommerce-services' ];
}

/**
 * Get the list of plugins we want to install for site setup
 * @return {Array} List of plugin slugs
 */
export function getPluginsForStoreSetup() {
	return [ 'woocommerce', 'woocommerce-gateway-stripe', 'woocommerce-services' ];
}
