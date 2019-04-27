/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { isHttps } from 'lib/url';
import versionCompare from 'lib/version-compare';
import getWordPressVersion from 'state/selectors/get-wordpress-version';
import isPluginActive from 'state/selectors/is-plugin-active';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isVipSite from 'state/selectors/is-vip-site';
import { getSiteAdminUrl, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';

export const isGutenframeEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
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

	return true;
};

export default isGutenframeEnabled;
