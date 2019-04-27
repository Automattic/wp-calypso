/** @format */

/**
 * Internal dependencies
 */
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isGutenframeEnabled from 'state/selectors/is-gutenframe-enabled';
import isVipSite from './is-vip-site';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
	}

	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
	}

	if ( isGutenframeEnabled( state, siteId ) ) {
		return true;
	}

	return false;
};

export default isGutenbergEnabled;
