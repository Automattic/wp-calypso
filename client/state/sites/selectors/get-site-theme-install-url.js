import getSiteAdminUrl from './get-site-admin-url';

/**
 * Returns a site's wp-admin Theme Install URL, or null if the admin URL
 * for the site cannot be determined.
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}       Full URL to Theme Install in wp-admin
 */
export default function getSiteThemeInstallUrl( state, siteId ) {
	return getSiteAdminUrl( state, siteId, 'theme-install.php' );
}
