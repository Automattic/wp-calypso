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
	THEME_ACTIVATE,
	THEME_ACTIVATED,
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
import { isJetpack } from './themes-last-query/selectors';
import { getQueryParams } from './themes-list/selectors';
import { getThemeById } from './themes/selectors';
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
			wasJetpack: isJetpack( getState() ),
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

export function activate( theme, site, source = 'unknown' ) {
	return dispatch => {
		dispatch( {
			type: THEME_ACTIVATE,
			theme: theme,
			site: site
		} );

		wpcom.undocumented().activateTheme( theme, site.ID )
			.then( () => {
				dispatch( activated( theme, site, source ) );
			} )
			.catch( error => {
				dispatch( receiveServerError( error ) );
			} );
	};
}

export function activated( theme, site, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		const previousTheme = getCurrentTheme( getState(), site.ID );
		const queryParams = getState().themes.themesList.get( 'query' );

		if ( typeof theme !== 'object' ) {
			theme = getThemeById( getState(), theme );
		}

		const action = {
			type: THEME_ACTIVATED,
			theme,
			site,
			siteId: site.ID
		};

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
