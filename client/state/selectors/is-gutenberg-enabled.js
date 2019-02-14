/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isVipSite from 'state/selectors/is-vip-site';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}
	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
	}
	return isEnabled( 'gutenberg' ) && ! isVipSite( state, siteId );
};

export default isGutenbergEnabled;
