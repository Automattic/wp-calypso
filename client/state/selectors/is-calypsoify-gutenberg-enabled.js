/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	//We do want calypsoify flows for Atomic sites
	if ( isSiteAutomatedTransfer( siteId ) ) {
		return true;
	}

	//not ready yet
	if ( isJetpackSite( state, siteId ) || isVipSite( state, siteId ) ) {
		return false;
	}

	return isEnabled( 'calypsoify/gutenberg' );
};

export default isCalypsoifyGutenbergEnabled;
