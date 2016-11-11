/** @ssr-ready **/

/**
 * External dependencies
 */
import conforms from 'lodash/conforms';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars
import property from 'lodash/property';

/**
 * Internal dependencies
 */
import {
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	THEME_BACK_PATH_SET,
	THEME_CLEAR_ACTIVATED,
	THEME_DETAILS_RECEIVE,
	THEME_DETAILS_RECEIVE_FAILURE,
	THEME_DETAILS_REQUEST,
	THEME_RECEIVE_CURRENT,
	THEME_REQUEST_CURRENT,
	THEME_REQUEST_CURRENT_FAILURE,
	THEMES_INCREMENT_PAGE,
	THEMES_QUERY,
	THEMES_RECEIVE,
	THEMES_RECEIVE_SERVER_ERROR,
} from '../action-types';
import { getCurrentTheme } from './current-theme/selectors';
import {
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getQueryParams } from './themes-list/selectors';
import wpcom from 'lib/wp';

export function fetchThemes( site ) {
	return ( dispatch, getState ) => {
		const queryParams = getQueryParams( getState() );
		const startTime = new Date().getTime();

		debug( 'Query params', queryParams );

		return wpcom.undocumented().themes( site, queryParams )
			.then( themes => {
				const responseTime = ( new Date().getTime() ) - startTime;
				return dispatch( receiveThemes( themes, site, queryParams, responseTime ) );
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

export function fetchCurrentTheme( siteId ) {
	return dispatch => {
		dispatch( {
			type: THEME_REQUEST_CURRENT,
			siteId,
		} );

		wpcom.undocumented().activeTheme( siteId )
			.then( theme => {
				debug( 'Received current theme', theme );
				dispatch( {
					type: THEME_RECEIVE_CURRENT,
					siteId,
					themeId: theme.id,
					themeName: theme.name,
					themeCost: theme.cost
				} );
			} ).catch( error => {
				dispatch( {
					type: THEME_REQUEST_CURRENT_FAILURE,
					siteId,
					error,
				} );
			} );
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
		themeDemoUri: theme.demo_uri,
		themeActive: theme.active,
		themePurchased: theme.purchased,
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

export function receiveThemes( data, site, queryParams, responseTime ) {
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

/**
 * Returns an action object to be used in signalling that a theme activation
 * has been triggered
 *
 * @param  {String}  themeId Theme to be activated
 * @param  {Object}  siteId Site used for activation
 * @return {Object}  Action object
 */
export function themeActivation( themeId, siteId ) {
	return {
		type: THEME_ACTIVATE_REQUEST,
		themeId,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a theme activation
 * has been successfull
 *
 * @param  {String}  themeId Theme received
 * @param  {Number}  siteId Site used for activation
 * @return {Object}  Action object
 */
export function themeActivated( themeId, siteId ) {
	return {
		type: THEME_ACTIVATE_REQUEST_SUCCESS,
		themeId,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a theme activation
 * has failed
 *
 * @param  {String}  themeId Theme received
 * @param  {Number}  siteId Site used for activation
 * @param  {Number}  error Error response from server
 * @return {Object}  Action object
 */
export function themeActivationFailed( themeId, siteId, error ) {
	return {
		type: THEME_ACTIVATE_REQUEST_FAILURE,
		themeId,
		siteId,
		error,
	};
}

export function activateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return dispatch => {
		dispatch( themeActivation( themeId, siteId ) );

		return wpcom.undocumented().activateTheme( themeId, siteId )
			.then( () => {
				dispatch( themeActivationSuccess( themeId, siteId, source, purchased ) );
			} )
			.catch( error => {
				dispatch( themeActivationFailed( themeId, siteId, error ) );
			} );
	};
}

export function themeActivationSuccess( themeId, siteId, source = 'unknown', purchased = false ) {
	const themeActivationSuccessThunk = ( dispatch, getState ) => {
		const action = themeActivated( themeId, siteId );
		const previousTheme = getCurrentTheme( getState(), siteId );
		const queryParams = getState().themes.themesList.get( 'query' );

		const trackThemeActivation = recordTracksEvent(
			'calypso_themeshowcase_theme_activate',
			{
				theme: themeId,
				previous_theme: previousTheme.id,
				source: source,
				purchased: purchased,
				search_term: queryParams.get( 'search' ) || null
			}
		);
		return withAnalytics( trackThemeActivation, action );
	};
	return themeActivationSuccessThunk; // it is named function just for testing purposes
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
