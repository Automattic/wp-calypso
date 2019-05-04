/** @format */

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getSiteAdminUrl, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getWordPressVersion from 'state/selectors/get-wordpress-version';
import versionCompare from 'lib/version-compare';
import isPluginActive from 'state/selectors/is-plugin-active';
import { isHttps } from 'lib/url';

export const isWpAdminGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	// We might want WP Admin flows for Jetpack and Atomic sites.
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

		// We do want Gutenframe flows for JP/AT sites that have been updated to Jetpack 7.3 or greater since it will
		// provide a way to handle the frame nonces verification. But only if we are over a insecure HTTPS connection or
		// the site has a SSL cert since the browser cannot embed insecure content in a resource loaded over a secure
		// HTTPS connection.
		if (
			isEnabled( 'jetpack/gutenframe' ) &&
			isJetpackMinimumVersion( state, siteId, '7.3-alpha' ) &&
			( 'http:' === window.location.protocol || isHttps( getSiteAdminUrl( state, siteId ) ) )
		) {
			return false;
		}

		return true;
	}

	return false;
};

export default isWpAdminGutenbergEnabled;
