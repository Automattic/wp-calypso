/**
 * Internal dependencies
 */
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';

/**
 * Returns a site's wp-admin Yoast onboarding page URL,
 * or null if the admin URL for the site cannot be determined.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}       Full URL to Yoast onboarding page in wp-admin
 */
export default function getSiteWordPressSeoWizardUrl( state, siteId ) {
	return getSiteAdminUrl( state, siteId, '/wp-admin/admin.php?page=wpseo_configurator' );
}
