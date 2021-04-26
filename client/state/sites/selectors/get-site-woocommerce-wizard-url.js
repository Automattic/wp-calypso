/**
 * Internal dependencies
 */
import getSiteAdminUrl from './get-site-admin-url';

/**
 * Returns a site's wp-admin WooCommerce Wizrd plugin URL,
 * or null if the admin URL for the site cannot be determined.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}       Full URL to WooCommerce Aizard plugin in wp-admin
 */
export default function getSiteWoocommerceWizardUrl( state, siteId ) {
	return getSiteAdminUrl(
		state,
		siteId,
		'admin.php?page=wc-admin&from-calypso&path=%2Fsetup-wizard'
	);
}
