/**
 * External dependencies
 */
import { conforms, map, omit, property } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import wporg from 'lib/wporg';
import {
	// Old action names
	THEME_BACK_PATH_SET,
	THEME_CLEAR_ACTIVATED,
	THEMES_INCREMENT_PAGE,
	THEMES_QUERY,
	LEGACY_THEMES_RECEIVE,
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
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
} from 'state/action-types';
import {
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getActiveTheme } from './selectors';
import { getQueryParams } from './themes-list/selectors';
import { getThemeIdFromStylesheet, filterThemesForJetpack, normalizeWpcomTheme } from './utils';

const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

// Old actions

export function fetchThemes( site ) {
	return ( dispatch, getState ) => {
		const queryParams = getQueryParams( getState() );
		const startTime = new Date().getTime();

		debug( 'Query params', queryParams );

		const extendedQueryParams = omit(
			{
				...queryParams,
				number: queryParams.perPage,
				apiVersion: site.jetpack ? '1' : '1.2'
			},
			'perPage'
		);

		return wpcom.undocumented().themes( site ? site.ID : null, extendedQueryParams )
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
			type: LEGACY_THEMES_RECEIVE,
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

// Set destination for 'back' button on theme sheet
export function setBackPath( path ) {
	return {
		type: THEME_BACK_PATH_SET,
		path,
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

		return wpcom.undocumented().themes( siteIdToQuery, queryWithApiVersion ).then( ( { found, themes: rawThemes } ) => {
			const themes = map( rawThemes, normalizeWpcomTheme );

			dispatch( receiveThemes( themes, siteId ) );

			let filteredThemes = themes;
			if ( siteId !== 'wpcom' ) {
				// A Jetpack site's themes endpoint ignores the query, returning an unfiltered list of all installed themes instead,
				// So we have to filter on the client side instead.
				filteredThemes = filterThemesForJetpack( themes, query );
			}

			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				themes: filteredThemes,
				siteId,
				query,
				found,
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

export function themeRequestFailure( siteId, themeId, error ) {
	return {
		type: THEME_REQUEST_FAILURE,
		siteId,
		themeId,
		error
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
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId
		} );

		if ( siteId === 'wporg' ) {
			return wporg.fetchThemeInformation( themeId ).then( ( theme ) => {
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
		}

		if ( siteId === 'wpcom' ) {
			return wpcom.undocumented().themeDetails( themeId ).then( ( theme ) => {
				dispatch( receiveTheme( normalizeWpcomTheme( theme ), siteId ) );
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
		}

		// See comment next to lib/wpcom-undocumented/lib/undocumented#jetpackThemeDetails() why we can't
		// the regular themeDetails() method for Jetpack sites yet.
		return wpcom.undocumented().jetpackThemeDetails( themeId, siteId ).then( ( { themes } ) => {
			dispatch( receiveThemes( map( themes, normalizeWpcomTheme ), siteId ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch(
				themeRequestFailure( siteId, themeId, error )
			);
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
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch( themeActivated( themeStylesheet, siteId, source, purchased ) );
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
 * on a given site. Careful, this action is different from most others here in that
 * expects a theme stylesheet string (not just a theme ID).
 *
 * @param  {String}   themeStylesheet Theme stylesheet string (*not* just a theme ID!)
 * @param  {Number}   siteId          Site ID
 * @param  {String}   source          The source that is reuquesting theme activation, e.g. 'showcase'
 * @param  {Boolean}  purchased       Whether the theme has been purchased prior to activation
 * @return {Function}                 Action thunk
 */
export function themeActivated( themeStylesheet, siteId, source = 'unknown', purchased = false ) {
	const themeActivatedThunk = ( dispatch, getState ) => {
		const action = {
			type: THEME_ACTIVATE_REQUEST_SUCCESS,
			themeStylesheet,
			siteId,
		};
		const previousThemeId = getActiveTheme( getState(), siteId );
		const queryParams = getState().themes.themesList.get( 'query' );

		const trackThemeActivation = recordTracksEvent(
			'calypso_themeshowcase_theme_activate',
			{
				theme: getThemeIdFromStylesheet( themeStylesheet ),
				previous_theme: previousThemeId,
				source: source,
				purchased: purchased,
				search_term: queryParams.get( 'search' ) || null
			}
		);
		dispatch( withAnalytics( trackThemeActivation, action ) );
	};
	return themeActivatedThunk; // it is named function just for testing purposes
}

/**
 * Returns an action object to be used in signalling that theme activated status
 * for site should be cleared
 *
 * @param  {Number}   siteId    Site ID
 * @return {Object}        Action object
 */
export function clearActivated( siteId ) {
	return {
		type: THEME_CLEAR_ACTIVATED,
		siteId
	};
}

/**
 * Triggers a theme upload to the given site.
 *
 * @param {Number} siteId -- Site to upload to
 * @param {File} file -- the theme zip to upload
 *
 * @return {Function} the action function
 */
export function uploadTheme( siteId, file ) {
	return dispatch => {
		dispatch( {
			type: THEME_UPLOAD_START,
			siteId,
		} );
		return wpcom.undocumented().uploadTheme( siteId, file, ( event ) => {
			dispatch( {
				type: THEME_UPLOAD_PROGRESS,
				siteId,
				loaded: event.loaded,
				total: event.total
			} );
		} )
			.then( ( theme ) => {
				dispatch( receiveTheme( theme, siteId ) );
				dispatch( {
					type: THEME_UPLOAD_SUCCESS,
					siteId,
					themeId: theme.id,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_UPLOAD_FAILURE,
					siteId,
					error
				} );
			} );
	};
}

/**
 * Clears any state remaining from a previous
 * theme upload to the given site.
 *
 * @param {Number} siteId -- site to clear state for
 *
 * @return {Object} the action object to dispatch
 */
export function clearThemeUpload( siteId ) {
	return {
		type: THEME_UPLOAD_CLEAR,
		siteId,
	};
}
