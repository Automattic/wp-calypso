/** @ssr-ready **/

/**
 * External dependencies
 */
import { conforms, property } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	// Old action names
	THEME_BACK_PATH_SET,
	THEME_CLEAR_ACTIVATED,
	THEME_DETAILS_RECEIVE,
	THEME_DETAILS_RECEIVE_FAILURE,
	THEME_DETAILS_REQUEST,
	THEMES_INCREMENT_PAGE,
	THEMES_QUERY,
	// New action names
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	THEMES_RECEIVE_SERVER_ERROR,
} from 'state/action-types';
import {
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
import { getCurrentTheme } from './current-theme/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getQueryParams } from './themes-list/selectors';
import { getThemeById } from './themes/selectors';

const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

// Old actions

export function fetchThemes( site ) {
	return ( dispatch, getState ) => {
		const queryParams = getQueryParams( getState() );
		const startTime = new Date().getTime();

		debug( 'Query params', queryParams );

		return wpcom.undocumented().themes( site, queryParams )
			.then( themes => {
				const responseTime = ( new Date().getTime() ) - startTime;
				return dispatch( legacyReceiveThemes( themes, site, queryParams, responseTime ) );
			} )
			.catch( error => receiveServerError( error ) );
	};
}

export function fetchNextPage( site ) {
	return dispatch => {
		dispatch( incrementThemesPage( site ) );
		return dispatch( fetchThemes( site ) );
	};
}

export function query( params ) {
	return {
		type: THEMES_QUERY,
		params: params
	};
}

export function incrementThemesPage( site ) {
	return {
		type: THEMES_INCREMENT_PAGE,
		site: site
	};
}

export function fetchThemeDetails( id, site ) {
	return dispatch => {
		dispatch( {
			type: THEME_DETAILS_REQUEST,
			themeId: id
		} );

		wpcom.undocumented().themeDetails( id, site )
			.then( themeDetails => {
				debug( 'Received theme details', themeDetails );
				dispatch( receiveThemeDetails( themeDetails ) );
			} )
			.catch( error => {
				dispatch( receiveThemeDetailsFailure( id, error ) );
			} );
	};
}

export function receiveThemeDetails( theme ) {
	return {
		type: THEME_DETAILS_RECEIVE,
		themeId: theme.id,
		themeName: theme.name,
		themeAuthor: theme.author,
		themePrice: theme.price,
		themeScreenshot: theme.screenshot,
		themeScreenshots: theme.screenshots,
		themeDescription: theme.description,
		themeDescriptionLong: theme.description_long,
		themeSupportDocumentation: theme.support_documentation || undefined,
		themeDownload: theme.download_uri || undefined,
		themeTaxonomies: theme.taxonomies,
		themeStylesheet: theme.stylesheet,
		themeDemoUri: theme.demo_uri
	};
}

export function receiveThemeDetailsFailure( id, error ) {
	debug( `Received error for theme ${ id }:`, error );
	return {
		type: THEME_DETAILS_RECEIVE_FAILURE,
		themeId: id,
		error: error,
	};
}

export function receiveServerError( error ) {
	return {
		type: THEMES_RECEIVE_SERVER_ERROR,
		error: error
	};
}

const isFirstPageOfSearch = conforms( {
	search: a => undefined !== a,
	page: a => a === 1
} );

export function legacyReceiveThemes( data, site, queryParams, responseTime ) {
	return ( dispatch, getState ) => {
		const themeAction = {
			type: THEMES_RECEIVE,
			siteId: site.ID,
			isJetpack: !! site.jetpack,
			wasJetpack: isJetpackSite( getState(), site.ID ),
			themes: data.themes,
			found: data.found,
			queryParams: queryParams
		};

		const trackShowcaseSearch = recordTracksEvent(
			'calypso_themeshowcase_search',
			{
				search_term: queryParams.search || null,
				tier: queryParams.tier,
				response_time_in_ms: responseTime,
				result_count: data.found,
				results_first_page: data.themes.map( property( 'id' ) )
			}
		);

		const action = isFirstPageOfSearch( queryParams )
			? withAnalytics( trackShowcaseSearch, themeAction )
			: themeAction;

		dispatch( action );

		return action;
	};
}

export function clearActivated() {
	return {
		type: THEME_CLEAR_ACTIVATED
	};
}

// Set destination for 'back' button on theme sheet
export function setBackPath( path ) {
	return {
		type: THEME_BACK_PATH_SET,
		path: path,
	};
}

// New actions

/**
 * Returns an action object to be used in signalling that a theme object has
 * been received.
 *
 * @param  {Object} theme  Theme received
 * @param  {Number} siteId ID of site for which themes have been received
 * @return {Object}        Action object
 */
export function receiveTheme( theme, siteId ) {
	return receiveThemes( [ theme ], siteId );
}

/**
 * Returns an action object to be used in signalling that theme objects have
 * been received.
 *
 * @param  {Array}  themes Themes received
 * @param  {Number} siteId ID of site for which themes have been received
 * @return {Object}        Action object
 */
export function receiveThemes( themes, siteId ) {
	return {
		type: THEMES_RECEIVE,
		themes,
		siteId
	};
}

/**
 * Triggers a network request to fetch themes for the specified site and query.
 *
 * @param  {Number|String} siteId Jetpack site ID or 'wpcom' for any WPCOM site
 * @param  {String}        query  Theme query
 * @return {Function}             Action thunk
 */
export function requestThemes( siteId, query = {} ) {
	return ( dispatch ) => {
		let siteIdToQuery, queryWithApiVersion;

		if ( siteId === 'wpcom' ) {
			siteIdToQuery = null;
			queryWithApiVersion = { ...query, apiVersion: '1.2' };
		} else {
			siteIdToQuery = siteId;
			queryWithApiVersion = { ...query, apiVersion: '1' };
		}

		dispatch( {
			type: THEMES_REQUEST,
			siteId,
			query
		} );

		return wpcom.undocumented().themes( siteIdToQuery, queryWithApiVersion ).then( ( { found, themes } ) => {
			dispatch( receiveThemes( themes, siteId ) );
			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId,
				query,
				found,
				themes
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId,
				query,
				error
			} );
		} );
	};
}

/**
 * Triggers a network request to fetch a specific theme from a site.
 *
 * @param  {String}   themeId Theme ID
 * @param  {Number}   siteId  Site ID
 * @return {Function}         Action thunk
 */
export function requestTheme( themeId, siteId ) {
	return ( dispatch ) => {
		let siteIdToQuery;

		if ( siteId === 'wpcom' ) {
			siteIdToQuery = null;
		} else {
			siteIdToQuery = siteId;
		}

		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId
		} );

		return wpcom.undocumented().themeDetails( themeId, siteIdToQuery ).then( ( theme ) => {
			dispatch( receiveTheme( theme, siteId ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_REQUEST_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}

/**
 * This action queries wpcom endpoint for active theme for site.
 * If request success information about active theme is stored in Redux themes subtree.
 * In case of error, error is stored in Redux themes subtree.
 *
 * @param  {Number}   siteId Site for which to check active theme
 * @return {Function}        Redux thunk with request action
 */
export function requestActiveTheme( siteId ) {
	return dispatch => {
		dispatch( {
			type: ACTIVE_THEME_REQUEST,
			siteId,
		} );

		return wpcom.undocumented().activeTheme( siteId )
			.then( theme => {
				debug( 'Received current theme', theme );
				dispatch( {
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId,
					themeId: theme.id,
					themeName: theme.name,
					themeCost: theme.cost
				} );
			} ).catch( error => {
				dispatch( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to activate a specific theme on a given site.
 *
 * @param  {String}   themeId   Theme ID
 * @param  {Number}   siteId    Site ID
 * @param  {String}   source    The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased Whether the theme has been purchased prior to activation
 * @return {Function}           Action thunk
 */
export function activateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return dispatch => {
		dispatch( {
			type: THEME_ACTIVATE_REQUEST,
			themeId,
			siteId,
		} );

		return wpcom.undocumented().activateTheme( themeId, siteId )
			.then( ( theme ) => {
				dispatch( themeActivated( theme, siteId, source, purchased ) );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_ACTIVATE_REQUEST_FAILURE,
					themeId,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Returns an action thunk to be used in signalling that a theme has been activated
 * on a given site.
 *
 * @param  {Object}   theme     Theme object
 * @param  {Number}   siteId    Site ID
 * @param  {String}   source    The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased Whether the theme has been purchased prior to activation
 * @return {Function}           Action thunk
 */
export function themeActivated( theme, siteId, source = 'unknown', purchased = false ) {
	const themeActivatedThunk = ( dispatch, getState ) => {
		if ( typeof theme !== 'object' ) {
			theme = getThemeById( getState(), theme );
		}

		const action = {
			type: THEME_ACTIVATE_REQUEST_SUCCESS,
			theme,
			siteId,
		};
		const previousTheme = getCurrentTheme( getState(), siteId );
		const queryParams = getState().themes.themesList.get( 'query' );

		const trackThemeActivation = recordTracksEvent(
			'calypso_themeshowcase_theme_activate',
			{
				theme: theme.id,
				previous_theme: previousTheme.id,
				source: source,
				purchased: purchased,
				search_term: queryParams.get( 'search' ) || null
			}
		);
		dispatch( withAnalytics( trackThemeActivation, action ) );
	};
	return themeActivatedThunk; // it is named function just for testing purposes
}
