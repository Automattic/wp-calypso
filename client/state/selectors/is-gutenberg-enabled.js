/** @format */

/**
 * Internal dependencies
 */
import isWpAdminGutenbergEnabled from 'state/selectors/is-wp-admin-gutenberg-enabled';
import isGutenframeEnabled from 'state/selectors/is-gutenframe-enabled';
import isVipSite from 'state/selectors/is-vip-site';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
	}

	return isWpAdminGutenbergEnabled( state, siteId ) || isGutenframeEnabled( state, siteId );
};

export default isGutenbergEnabled;
