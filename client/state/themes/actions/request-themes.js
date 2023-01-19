import config from '@automattic/calypso-config';
import { map, property } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { fetchThemesList as fetchWporgThemesList } from 'calypso/lib/wporg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { THEMES_REQUEST, THEMES_REQUEST_FAILURE } from 'calypso/state/themes/action-types';
import { receiveThemes } from 'calypso/state/themes/actions/receive-themes';
import { prependThemeFilterKeys } from 'calypso/state/themes/selectors';
import {
	normalizeJetpackTheme,
	normalizeWpcomTheme,
	normalizeWporgTheme,
} from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

const requestWporgThemes = ( query = {} ) =>
	fetchWporgThemesList( query ).then( ( response ) => {
		const themes = map( response?.themes || [], normalizeWporgTheme );
		const found = response?.info?.results || 0;
		return { themes, found };
	} );

const requestWpcomThemes = ( query = {}, locale ) =>
	wpcom.req
		.get(
			'/themes',
			Object.assign(
				{
					...query,
					apiVersion: '1.2',
					include_blankcanvas_theme: config.isEnabled( 'pattern-assembler/logged-out-showcase' )
						? 'true'
						: null,
					include_marketplace_themes: config.isEnabled( 'themes/third-party-premium' )
						? 'true'
						: null,
				},
				locale ? { locale } : null
			)
		)
		.then( ( response ) => {
			const themes = map( response?.themes || [], normalizeWpcomTheme );
			const found = response?.found || 0;
			return { themes, found };
		} );

const requestJetpackSitethemes = ( siteId, query = {} ) =>
	wpcom.req
		.get( `/sites/${ siteId }/themes`, { ...query, apiVersion: '1' } )
		.then( ( response ) => {
			const themes = map( response?.themes || [], normalizeJetpackTheme );
			const found = response?.found || 0;
			return { themes, found };
		} );

const recordSearchEvents = ( { dispatch, found, getState, query, startTime, themes } ) => {
	if ( ( query.search || query.filter ) && query.page === 1 ) {
		const responseTime = new Date().getTime() - startTime;
		const search_taxonomies = prependThemeFilterKeys( getState(), query.filter );
		const search_term = search_taxonomies + ( query.search || '' );
		const trackShowcaseSearch = recordTracksEvent( 'calypso_themeshowcase_search', {
			search_term: search_term || null,
			search_taxonomies,
			tier: query.tier,
			response_time_in_ms: responseTime,
			result_count: found,
			results_first_page: themes.map( property( 'id' ) ).join(),
		} );
		dispatch( trackShowcaseSearch );

		if ( found === 0 ) {
			const trackShowcaseEmptySearch = recordTracksEvent(
				'calypso_themeshowcase_search_empty_results',
				{
					search_term: search_term || null,
					response_time_in_ms: responseTime,
				}
			);
			dispatch( trackShowcaseEmptySearch );
		}
	}
};

/**
 * Triggers a network request to fetch themes for the specified site and query.
 *
 * @param  {number|string} siteId        Jetpack site ID,
 *                                       or 'wpcom' for any WPCOM themes,
 *                                       or 'wporg' for any WPORG themes,
 *                                       or 'all' for any WPCOM and WPORG themes.
 * @param  {object}        query         Theme query
 * @param  {string}        query.search  Search string
 * @param  {string}        query.tier    Theme tier: 'free', 'premium', or '' (either)
 * @param  {string}        query.filter  Filter
 * @param  {number}        query.number  How many themes to return per page
 * @param  {number}        query.offset  At which item to start the set of returned themes
 * @param  {number}        query.page    Which page of matching themes to return
 * @param  {string}        locale        Locale slug
 * @returns {Function}                    Action thunk
 */
export function requestThemes( siteId, query = {}, locale ) {
	return ( dispatch, getState ) => {
		const startTime = new Date().getTime();

		dispatch( {
			type: THEMES_REQUEST,
			siteId,
			query,
		} );

		if ( siteId !== 'all' ) {
			let request;
			if ( siteId === 'wporg' ) {
				request = () => requestWporgThemes( query );
			} else if ( siteId === 'wpcom' ) {
				request = () => requestWpcomThemes( query, locale );
			} else {
				request = () => requestJetpackSitethemes( siteId, query );
			}

			return request()
				.then( ( { themes, found } ) => {
					recordSearchEvents( { dispatch, found, getState, query, startTime, themes } );
					dispatch( receiveThemes( themes, siteId, query, found ) );
				} )
				.catch( ( error ) => {
					dispatch( {
						type: THEMES_REQUEST_FAILURE,
						siteId,
						query,
						error,
					} );
				} );
		}

		return requestWpcomThemes( query, locale )
			.then( ( wpcomResponse ) => {
				let allThemes = wpcomResponse.themes;
				let allFound = wpcomResponse.found;

				dispatch( receiveThemes( wpcomResponse.themes, 'wpcom', query, wpcomResponse.found ) );

				return requestWporgThemes( query )
					.then( ( wporgResponse ) => {
						allThemes = [ ...wporgResponse.themes, ...allThemes ];
						allFound += wporgResponse.found;

						dispatch( receiveThemes( wporgResponse.themes, 'wporg', query, wporgResponse.found ) );

						recordSearchEvents( {
							dispatch,
							found: allFound,
							getState,
							query,
							startTime,
							themes: allThemes,
						} );
					} )
					.catch( ( error ) => {
						dispatch( {
							type: THEMES_REQUEST_FAILURE,
							siteId,
							query,
							error,
						} );
					} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEMES_REQUEST_FAILURE,
					siteId,
					query,
					error,
				} );
			} );
	};
}
