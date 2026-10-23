/**
 * The retired `/start/woocommerce-install` flow and its `/woocommerce-installation` landing page
 * redirect to the WooCommerce plugin page, where WooCommerce is now added from.
 */
export const LEGACY_WOOCOMMERCE_INSTALL_FLOW = 'woocommerce-install';

/**
 * The WooCommerce plugin page for a site, or the site picker for it without one.
 * @param siteSlug The site to install WooCommerce on.
 */
export function getWooCommercePluginPage( siteSlug?: unknown ): string {
	return typeof siteSlug === 'string' && siteSlug
		? `/plugins/woocommerce/${ siteSlug }`
		: '/plugins/woocommerce';
}
