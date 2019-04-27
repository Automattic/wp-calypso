/** @format */

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite, getSiteAdminUrl, isJetpackMinimumVersion } from 'state/sites/selectors';
import { isHttps } from 'lib/url';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
	}

	// We do want Gutenframe flows for JP/AT sites that have been updated to Jetpack 7.3 or greater since it will
	// handle the required token verification. But only if the site has a SSL cert since the browser cannot embed
	// insecure content in a resource loaded over a secure HTTPS connection.
	if (
		isEnabled( 'jetpack/gutenframe' ) &&
		isJetpackMinimumVersion( state, siteId, '7.3-alpha' ) &&
		isHttps( getSiteAdminUrl( state, siteId ) )
	) {
		return isEnabled( 'gutenberg' ) && ! isVipSite( state, siteId );
	}

	return (
		isEnabled( 'gutenberg' ) && ! isJetpackSite( state, siteId ) && ! isVipSite( state, siteId )
	);
};

export default isGutenbergEnabled;
