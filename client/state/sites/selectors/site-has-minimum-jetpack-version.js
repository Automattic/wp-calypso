/**
 * Internal dependencies
 */
import config from 'config';
import versionCompare from 'lib/version-compare';
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Return true is the given Jetpack site has a version equal or greater than
 * the minimum Jetpack version as set by the 'jetpack_min_version' config value.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param  {object} state - whole state tree
 * @param  {Number} siteId - site id
 * @return {?Boolean} true if the site has minimum jetpack version
 */
export default function siteHasMinimumJetpackVersion( state, siteId ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	if ( ! siteJetpackVersion ) {
		return null;
	}

	const jetpackMinVersion = config( 'jetpack_min_version' );

	return versionCompare( siteJetpackVersion, jetpackMinVersion ) >= 0;
}
