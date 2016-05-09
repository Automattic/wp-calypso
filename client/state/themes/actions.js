/** @ssr-ready **/

/**
 * External dependencies
 */
import page from 'page';
import conforms from 'lodash/conforms';
import defer from 'lodash/defer';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars
import property from 'lodash/property';

/**
 * Internal dependencies
 */
import {
	THEME_ACTIVATE,
	THEME_ACTIVATED,
	THEME_CLEAR_ACTIVATED,
	THEME_CUSTOMIZE,
	THEME_DETAILS_RECEIVE,
	THEME_DETAILS,
	THEME_PREVIEW,
	THEME_PURCHASE,
	THEME_RECEIVE_CURRENT,
	THEME_SIGNUP_WITH,
	THEME_SUPPORT,
	THEMES_INCREMENT_PAGE,
	THEMES_QUERY,
	THEMES_RECEIVE,
	THEMES_RECEIVE_SERVER_ERROR,
} from '../action-types';
import ThemeHelpers from 'my-sites/themes/helpers';
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

		wpcom.undocumented().themes( site, queryParams )
			.then( themes => {
				const responseTime = ( new Date().getTime() ) - startTime;
				dispatch( receiveThemes( themes, site, queryParams, responseTime ) );
			} )
			.catch( error => receiveServerError( error ) );
	};
}

export function fetchNextPage( site ) {
	return dispatch => {
		dispatch( incrementThemesPage( site ) );
		dispatch( fetchThemes( site ) );
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

export function fetchCurrentTheme( site ) {
	return dispatch => {
		wpcom.undocumented().activeTheme( site.ID )
			.then( theme => {
				debug( 'Received current theme', theme );
				dispatch( {
					type: THEME_RECEIVE_CURRENT,
					site: site,
					themeId: theme.id,
					themeName: theme.name,
					themeCost: theme.cost
				} );
			} ); // TODO: add .catch() error handler
	};
}

export function fetchThemeDetails( id ) {
	return dispatch => {
		wpcom.undocumented().themeDetails( id )
			.then( themeDetails => {
				debug( 'Received theme details', themeDetails );
				dispatch( receiveThemeDetails( themeDetails ) );
			} )
			.catch( error => {
				dispatch( receiveServerError( error ) );
			} );
	};
}

export function receiveThemeDetails( theme ) {
	return {
		type: THEME_DETAILS_RECEIVE,
		themeId: theme.id,
		themeName: theme.name,
		themeAuthor: theme.author,
		themePrice: theme.price ? theme.price.display : undefined,
		themeScreenshot: theme.screenshot,
		themeDescription: theme.description,
		themeDescriptionLong: theme.description_long,
		themeSupportDocumentation: theme.extended ? theme.extended.support_documentation : undefined,
		themeTaxonomies: theme.taxonomies,
		themeStylesheet: theme.stylesheet,
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

		defer( () => {
			const action = {
				type: THEME_ACTIVATED,
				theme,
				site
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
		} );
	};
}

export function clearActivated() {
	return {
		type: THEME_CLEAR_ACTIVATED
	};
}

export function signup( theme ) {
	return dispatch => {
		const signupUrl = ThemeHelpers.getSignupUrl( theme );

		dispatch( {
			type: THEME_SIGNUP_WITH,
			theme
		} );

		// `ThemeHelpers.navigateTo` uses `page()` here, which messes with `pushState`,
		// which we don't want here, since we're navigating away from Calypso.
		window.location = signupUrl;
	};
}

// Might be obsolete, since in my-sites/themes, we're using `getUrl()` for Details
export function details( theme, site ) {
	return dispatch => {
		const detailsUrl = ThemeHelpers.getDetailsUrl( theme, site );

		dispatch( {
			type: THEME_DETAILS,
			theme: theme
		} );

		ThemeHelpers.navigateTo( detailsUrl, site.jetpack );
	};
}

// Might be obsolete, since in my-sites/themes, we're using `getUrl()` for Support
export function support( theme, site ) {
	return dispatch => {
		const supportUrl = ThemeHelpers.getSupportUrl( theme, site );

		dispatch( {
			type: THEME_SUPPORT,
			theme: theme
		} );

		ThemeHelpers.navigateTo( supportUrl, site.jetpack );
	};
}

export function preview( theme, site ) {
	return dispatch => {
		const previewUrl = ThemeHelpers.getPreviewUrl( theme, site );

		dispatch( {
			type: THEME_PREVIEW,
			site: site
		} );

		ThemeHelpers.navigateTo( previewUrl, site.jetpack );
	};
}

export function customize( theme, site ) {
	return dispatch => {
		const customizeUrl = ThemeHelpers.getCustomizeUrl( theme, site );

		dispatch( {
			type: THEME_CUSTOMIZE,
			site: site.id
		} );

		ThemeHelpers.navigateTo( customizeUrl, site.jetpack );
	};
}

export function purchase( theme, site, source = 'unknown' ) {
	const CartActions = require( 'lib/upgrades/actions' );
	const themeItem = require( 'lib/cart-values/cart-items' ).themeItem;

	return dispatch => {
		CartActions.addItem( themeItem( theme.id, source ) );

		defer( () => {
			page( '/checkout/' + site.slug );

			dispatch( {
				type: THEME_PURCHASE,
				id: theme.id,
				site: site
			} );
		} );
	};
}
