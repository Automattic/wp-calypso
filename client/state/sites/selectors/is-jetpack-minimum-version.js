/**
 * Internal dependencies
 */
import versionCompare from 'lib/version-compare';
import isJetpackSite from './is-jetpack-site';
import getSiteOption from './get-site-option';

/**
 * Returns true if the Jetpack site is running a version meeting the specified
 * minimum, or false if the Jetpack site is running an older version. Returns
 * null if the version cannot be determined or if not a Jetpack site.
 *
 * @param  {Object}   state   Global state tree
 * @param  {Number}   siteId  Site ID
 * @param  {String}   version Minimum version
 * @return {?Boolean}         Whether running minimum version
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
