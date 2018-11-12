/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	const calypsoifyGutenberg = isEnabled( 'calypsoify/gutenberg' );
	const isJetpack = isJetpackSite( state, siteId );
	const isVip = isVipSite( state, siteId );

	return calypsoifyGutenberg && ! isJetpack && ! isVip;
};

export default isCalypsoifyGutenbergEnabled;
