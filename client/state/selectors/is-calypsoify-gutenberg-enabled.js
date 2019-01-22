/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import getWordPressVersion from 'state/selectors/get-wordpress-version';
import versionCompare from 'lib/version-compare';
import isPluginActive from 'state/selectors/is-plugin-active';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	// For Atomic sites.
	if ( isAtomicSite( state, siteId ) && isEnabled( 'calypsoify/gutenberg' ) ) {
		const wpVersion = getWordPressVersion( state, siteId );

		// But not if they activated Classic editor plugin (effectively opting out of Gutenberg)
		if ( isPluginActive( state, siteId, 'classic-editor' ) ) {
			return false;
		}

		// But only once they have been updated to WordPress version 5.0 or greater
		// Since it will provide Gutenberg editor by default
		if ( versionCompare( wpVersion, '5.0', '>=' ) ) {
			return true;
		}
	}

	// No support for Jetpack and VIP sites yet.
	if ( isJetpackSite( state, siteId ) || isVipSite( state, siteId ) ) {
		return false;
	}

	// For Simple sites.
	return isEnabled( 'calypsoify/gutenberg' );
};

export default isCalypsoifyGutenbergEnabled;
