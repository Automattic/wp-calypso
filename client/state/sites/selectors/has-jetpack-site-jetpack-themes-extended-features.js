/**
 * Internal dependencies
 */
import versionCompare from 'lib/version-compare';
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Determines if the Jetpack plugin of a Jetpack Site has extend themes management features.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} true if the site has Jetpack extended themes management features
 */
export default function hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	return versionCompare( siteJetpackVersion, '4.7' ) >= 0;
}
