import getSiteAdminUrl from './get-site-admin-url';

/**
 * Returns a site's wp-admin WooCommerce plugin URL, or null if the admin URL
 * for the site cannot be determined.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}        Full URL to WooCommerce plugin in wp-admin
 */
export default function getSiteWooCommerceUrl( state, siteId ) {
	return getSiteAdminUrl( state, siteId, 'admin.php?page=wc-admin&from-calypso' );
}
