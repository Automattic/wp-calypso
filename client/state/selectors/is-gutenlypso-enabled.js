/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';

export const isGutenlypsoEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
	}

	if ( isEnabled( 'gutenberg' ) && isEnabled( 'gutenberg/opt-in' ) ) {
		return true;
	}

	return false;
};

export default isGutenlypsoEnabled;
