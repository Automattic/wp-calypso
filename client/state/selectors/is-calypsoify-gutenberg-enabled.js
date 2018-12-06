/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getSelectedSiteWordPressVersion from 'state/selectors/get-selected-site-wordpress-version';
import versionCompare from 'lib/version-compare';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	// We do want Calypsoify flows for Atomic sites
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		const wpVersion = getSelectedSiteWordPressVersion( state );

		// But only once they have been updated to WordPress version 5.0 or greater
		// Since it will provide Gutenberg editor by default
		if ( versionCompare( wpVersion, '5.0', '>=' ) ) {
			return true;
		}
	}

	//not ready yet
	if ( isJetpackSite( state, siteId ) || isVipSite( state, siteId ) ) {
		return false;
	}
	return isEnabled( 'calypsoify/gutenberg' );
};

export default isCalypsoifyGutenbergEnabled;
