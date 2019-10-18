/**
 * Internal dependencies
 */
import versionCompare from 'lib/version-compare';
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Returns the remote management url for a Jetpack site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?String} the remote management url for the site
 */
export default function getJetpackSiteRemoteManagementUrl( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' ),
		siteAdminUrl = getSiteOption( state, siteId, 'admin_url' ),
		configure = versionCompare( siteJetpackVersion, '3.4', '>=' ) ? 'manage' : 'json-api';

	return siteAdminUrl + 'admin.php?page=jetpack&configure=' + configure;
}
