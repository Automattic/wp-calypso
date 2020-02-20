/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';

/**
 * Returns the url to the wp-admin area for a site, or null if the admin URL
 * for the site cannot be determined.
 *
 * @see https://developer.wordpress.org/reference/functions/get_admin_url/
 *
 * @param  {object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @param  {?string} path   Admin screen path
 * @returns {?string}        Admin URL
 */
export default function getSiteAdminUrl( state, siteId, path = '' ) {
	const adminUrl = getSiteOption( state, siteId, 'admin_url' );
	if ( ! adminUrl ) {
		return null;
	}

	return adminUrl + path.replace( /^\//, '' );
}
