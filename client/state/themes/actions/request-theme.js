/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { fetchThemeInformation as fetchWporgThemeInformation } from 'lib/wporg';
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
} from 'state/themes/action-types';
import { receiveTheme } from 'state/themes/actions/receive-theme';
import { receiveThemes } from 'state/themes/actions/receive-themes';
import { themeRequestFailure } from 'state/themes/actions/theme-request-failure';
import {
	normalizeJetpackTheme,
	normalizeWpcomTheme,
	normalizeWporgTheme,
} from 'state/themes/utils';

import 'state/themes/init';

/**
 * Triggers a network request to fetch a specific theme from a site.
 *
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID
 * @returns {Function}         Action thunk
 */
export function requestTheme( themeId, siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId,
		} );

		if ( siteId === 'wporg' ) {
			return fetchWporgThemeInformation( themeId )
				.then( ( theme ) => {
					// Apparently, the WP.org REST API endpoint doesn't 404 but instead returns false
					// if a theme can't be found.
					if ( ! theme ) {
						throw 'Theme not found'; // Will be caught by .catch() below
					}
					dispatch( receiveTheme( normalizeWporgTheme( theme ), siteId ) );
					dispatch( {
						type: THEME_REQUEST_SUCCESS,
						siteId,
						themeId,
					} );
				} )
				.catch( ( error ) => {
					dispatch( {
						type: THEME_REQUEST_FAILURE,
						siteId,
						themeId,
						error,
					} );
				} );
		}

		if ( siteId === 'wpcom' ) {
			return wpcom
				.undocumented()
				.themeDetails( themeId )
				.then( ( theme ) => {
					dispatch( receiveTheme( normalizeWpcomTheme( theme ), siteId ) );
					dispatch( {
						type: THEME_REQUEST_SUCCESS,
						siteId,
						themeId,
					} );
				} )
				.catch( ( error ) => {
					dispatch( {
						type: THEME_REQUEST_FAILURE,
						siteId,
						themeId,
						error,
					} );
				} );
		}

		// See comment next to lib/wpcom-undocumented/lib/undocumented#jetpackThemeDetails() why we can't
		// the regular themeDetails() method for Jetpack sites yet.
		return wpcom
			.undocumented()
			.jetpackThemeDetails( themeId, siteId )
			.then( ( { themes } ) => {
				dispatch( receiveThemes( map( themes, normalizeJetpackTheme ), siteId ) );
				dispatch( {
					type: THEME_REQUEST_SUCCESS,
					siteId,
					themeId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( themeRequestFailure( siteId, themeId, error ) );
			} );
	};
}
