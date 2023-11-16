import { map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { fetchThemeInformation as fetchWporgThemeInformation } from 'calypso/lib/wporg';
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
} from 'calypso/state/themes/action-types';
import { receiveTheme } from 'calypso/state/themes/actions/receive-theme';
import { receiveThemes } from 'calypso/state/themes/actions/receive-themes';
import { themeRequestFailure } from 'calypso/state/themes/actions/theme-request-failure';
import {
	normalizeJetpackTheme,
	normalizeWpcomTheme,
	normalizeWporgTheme,
} from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to fetch a specific theme from a site.
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID
 * @param  {string}   locale  Locale slug
 * @returns {Function}         Action thunk
 */
export function requestTheme( themeId, siteId, locale ) {
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
			return wpcom.req
				.get(
					`/themes/${ themeId }`,
					Object.assign( { apiVersion: '1.2' }, locale ? { locale } : null )
				)
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

		/*
		 * Hack! Calling the theme modify endpoint without specifying an action will return the full details for a theme.
		 * FIXME In the long run, we should try to enable the /sites/${ siteId }/themes/${ theme } endpoint for Jetpack
		 * sites so we can delete this workaround and use the same endpoint for Jetpack sites, too.
		 */
		return wpcom.req
			.post( `/sites/${ siteId }/themes`, { themes: themeId } )
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
