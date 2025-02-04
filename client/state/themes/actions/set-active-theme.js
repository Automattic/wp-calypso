import debugFactory from 'debug';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { ACTIVE_THEME_REQUEST_SUCCESS } from 'calypso/state/themes/action-types';
import { receiveTheme } from 'calypso/state/themes/actions/receive-theme';

import 'calypso/state/themes/init';

const debug = debugFactory( 'calypso:themes:actions' );

/**
 * Sets the active theme for a given site.
 * @param  {number}   siteId Site for which to check active theme
 * @param  {Object}   theme The theme to set as active
 * @returns {Function}        Redux thunk with request action
 */
export function setActiveTheme( siteId, theme ) {
	return ( dispatch, getState ) => {
		debug( 'Setting current theme', theme );
		// We want to store the theme object in the appropriate Redux subtree -- either 'wpcom'
		// for WPCOM sites, or siteId for Jetpack sites.
		const siteIdOrWpcom = isJetpackSite( getState(), siteId ) ? siteId : 'wpcom';
		dispatch( receiveTheme( theme, siteIdOrWpcom ) );
		dispatch( {
			type: ACTIVE_THEME_REQUEST_SUCCESS,
			siteId,
			theme,
		} );
	};
}
