/**
 * Internal dependencies
 */
import versionCompare from 'calypso/lib/version-compare';
import isJetpackSite from './is-jetpack-site';
import getSiteOption from './get-site-option';

/**
 * Returns true if the Jetpack site is running a version meeting the specified
 * minimum, or false if the Jetpack site is running an older version. Returns
 * null if the version cannot be determined or if not a Jetpack site.
 *
 * @param  {object}   state   Global state tree
 * @param  {number}   siteId  Site ID
 * @param  {string}   version Minimum version
 * @returns {?boolean}         Whether running minimum version
 */
export default function isJetpackMinimumVersion( state, siteId, version ) {
	const isJetpack = isJetpackSite( state, siteId );
	if ( ! isJetpack ) {
		return null;
	}

	const siteVersion = getSiteOption( state, siteId, 'jetpack_version' );
	if ( ! siteVersion ) {
		return null;
	}

	return versionCompare( siteVersion, version, '>=' );
}
