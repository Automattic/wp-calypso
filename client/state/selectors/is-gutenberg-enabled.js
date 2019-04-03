/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
	}

	if ( isEnabled( 'jetpack/gutenframe' ) ) {
		return isEnabled( 'gutenberg' ) && ! isVipSite( state, siteId );
	}

	return (
		isEnabled( 'gutenberg' ) && ! isJetpackSite( state, siteId ) && ! isVipSite( state, siteId )
	);
};

export default isGutenbergEnabled;
