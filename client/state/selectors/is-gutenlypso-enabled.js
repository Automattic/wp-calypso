/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';

export const isGutenlypsoEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isJetpackSite( state, siteId ) ) {
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
