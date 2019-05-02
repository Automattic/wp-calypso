/** @format */

/**
 * Internal dependencies
 */
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isGutenframeEnabled from 'state/selectors/is-gutenframe-enabled';
import isVipSite from 'state/selectors/is-vip-site';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
	}

	return (
		isCalypsoifyGutenbergEnabled( state, siteId ) ||
		isGutenframeEnabled( state, siteId )
	);
};

export default isGutenbergEnabled;
