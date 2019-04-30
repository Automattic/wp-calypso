/** @format */

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isVipSite from 'state/selectors/is-vip-site';
import versionCompare from 'lib/version-compare';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getWordPressVersion from 'state/selectors/get-wordpress-version';
import isPluginActive from 'state/selectors/is-plugin-active';
import { getSiteAdminUrl, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { isHttps } from 'lib/url';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
	}

	// We do want Gutenframe flows for Jetpack and Atomic sites.
	if ( isJetpackSite( state, siteId ) || isSiteAutomatedTransfer( state, siteId ) ) {
		// But only once they have been updated to WordPress version 5.0 or greater since it will provide Gutenberg
		// editor by default.
		const wpVersion = getWordPressVersion( state, siteId );
		if ( versionCompare( wpVersion, '5.0', '<' ) ) {
			return false;
		}

		// But not if they activated the Classic Editor plugin (effectively opting out of Gutenberg).
		if ( isPluginActive( state, siteId, 'classic-editor' ) ) {
			return false;
		}

		// And also only if they have been updated to Jetpack 7.3 or greater since it will provide a way to handle the
		// frame nonces verification.
		if ( ! isJetpackMinimumVersion( state, siteId, '7.3-alpha' ) ) {
			return false;
		}

		// But only if the site has a SSL cert since the browser cannot embed insecure content in a resource loaded
		// over a secure HTTPS connection.
		if ( ! isHttps( getSiteAdminUrl( state, siteId ) ) ) {
			return false;
		}

		return isEnabled( 'jetpack/gutenframe' );
	}

	return (
		isEnabled( 'gutenberg' ) && ! isJetpackSite( state, siteId ) && ! isVipSite( state, siteId )
	);
};

export default isGutenbergEnabled;
