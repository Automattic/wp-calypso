/** @format */
/**
 * Internal dependencies
 */
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

	return true;
};

export default isGutenlypsoEnabled;
