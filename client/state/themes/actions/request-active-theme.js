/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	ACTIVE_THEME_REQUEST_FAILURE,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST,
} from 'state/themes/action-types';
import { isJetpackSite } from 'state/sites/selectors';
import { receiveTheme } from 'state/themes/actions/receive-theme';

import 'state/themes/init';

const debug = debugFactory( 'calypso:themes:actions' );

/**
 * This action queries wpcom endpoint for active theme for site.
 * If request success information about active theme is stored in Redux themes subtree.
 * In case of error, error is stored in Redux themes subtree.
 *
 * @param  {number}   siteId Site for which to check active theme
 * @returns {Function}        Redux thunk with request action
 */
export function requestActiveTheme( siteId ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: ACTIVE_THEME_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.activeTheme( siteId )
			.then( ( theme ) => {
				debug( 'Received current theme', theme );
				// We want to store the theme object in the appropriate Redux subtree -- either 'wpcom'
				// for WPCOM sites, or siteId for Jetpack sites.
				const siteIdOrWpcom = isJetpackSite( getState(), siteId ) ? siteId : 'wpcom';
				dispatch( receiveTheme( theme, siteIdOrWpcom ) );
				dispatch( {
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId,
					theme,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
