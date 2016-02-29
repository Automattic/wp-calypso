/** @ssr-ready **/

/**
 * External dependencies
 */
import page from 'page';
import defer from 'lodash/defer';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
import ActionTypes from './action-types';
import ThemeHelpers from 'my-sites/themes/helpers';
import { getCurrentTheme } from './current-theme/selectors';
import { isJetpack } from './themes-last-query/selectors';
import { getQueryParams } from './themes-list/selectors';
import { getThemeById } from './themes/selectors';
import wpcom from 'lib/wp';

export function fetchThemes( site ) {
	return ( dispatch, getState ) => {
		const queryParams = getQueryParams( getState() );
		const startTime = new Date().getTime();
		const callback = ( error, data ) => {
			debug( 'Received themes data', data );
			if ( error ) {
				dispatch( receiveServerError( error ) );
			} else {
				const responseTime = ( new Date().getTime() ) - startTime;
				dispatch( receiveThemes( data, site, queryParams, responseTime ) );
			}
		};

		debug( 'Query params', queryParams );
		wpcom.undocumented().themes( site, queryParams, callback );
	}
}

export function fetchNextPage( site ) {
	return dispatch => {
		dispatch( incrementThemesPage( site ) );
		dispatch( fetchThemes( site ) );
	}
}

export function query( params ) {
	return {
		type: ActionTypes.QUERY_THEMES,
		params: params
	};
}

export function incrementThemesPage( site ) {
	return {
		type: ActionTypes.INCREMENT_THEMES_PAGE,
		site: site
	}
}

export function fetchCurrentTheme( site ) {
	return dispatch => {
		const callback = ( error, data ) => {
			debug( 'Received current theme', data );
			if ( ! error ) {
				dispatch( {
					type: ActionTypes.RECEIVE_CURRENT_THEME,
					site: site,
					themeId: data.id,
					themeName: data.name,
					themeCost: data.cost
				} );
			}
		};
		wpcom.undocumented().activeTheme( site.ID, callback );
	};
}

export function fetchThemeDetails( id ) {
	return dispatch => {
		const callback = ( error, data ) => {
			debug( 'Received theme details', data );
			if ( error ) {
				dispatch( receiveServerError( error ) );
			} else {
				dispatch( {
					type: ActionTypes.RECEIVE_THEME_DETAILS,
					themeId: data.id,
					themeName: data.name,
					themeAuthor: data.author,
					themePrice: data.price ? data.price.display : undefined,
					themeScreenshot: data.screenshot,
					themeDescription: data.description,
					themeDescriptionLong: data.description_long,
					themeSupportDocumentation: data.extended ? data.extended.support_documentation : undefined,
				} );
			}
		};
		wpcom.undocumented().themeDetails( id, callback );
	}
}

export function receiveServerError( error ) {
	return {
		type: ActionTypes.RECEIVE_THEMES_SERVER_ERROR,
		error: error
	};
}

export function receiveThemes( data, site, queryParams, responseTime ) {
	return ( dispatch, getState ) => {
		let meta = {};

		if ( queryParams.search && queryParams.page === 1 ) {
			meta = {
				analytics: {
					type: 'calypso_themeshowcase_search',
					payload: {
						search_term: queryParams.search || null,
						tier: queryParams.tier,
						response_time_in_ms: responseTime,
						result_count: data.found,
						results_first_page: data.themes.map( theme => theme.id )
					}
				}
			}
		}

		dispatch( {
			type: ActionTypes.RECEIVE_THEMES,
			siteId: site.ID,
			isJetpack: !! site.jetpack,
			wasJetpack: isJetpack( getState() ),
			themes: data.themes,
			found: data.found,
			queryParams: queryParams,
			meta
		} );
	}
}

export function activate( theme, site, source = 'unknown' ) {
	return dispatch => {
		const callback = err => {
			if ( err ) {
				dispatch( receiveServerError( err ) );
			} else {
				dispatch( activated( theme, site, source ) );
			}
		};

		dispatch( {
			type: ActionTypes.ACTIVATE_THEME,
			theme: theme,
			site: site
		} );

		wpcom.undocumented().activateTheme( theme, site.ID, callback );
	}
}

export function activated( theme, site, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		const previousTheme = getCurrentTheme( getState(), site.ID );
		const queryParams = getState().themes.themesList.get( 'query' );

		if ( typeof theme !== 'object' ) {
			theme = getThemeById( getState(), theme );
		}

		defer( () => dispatch( {
			type: ActionTypes.ACTIVATED_THEME,
			theme,
			site,
			meta: {
				analytics: {
					type: 'calypso_themeshowcase_theme_activate',
					payload: {
						theme: theme.id,
						previous_theme: previousTheme.id,
						source: source,
						purchased: purchased,
						search_term: queryParams.get( 'search' ) || null
					}
				}
			}
		} ) );
	}
};

export function clearActivated() {
	return {
		type: ActionTypes.CLEAR_ACTIVATED_THEME
	};
};

export function signup( theme ) {
	return dispatch => {
		const signupUrl = ThemeHelpers.getSignupUrl( theme );

		dispatch( {
			type: ActionTypes.SIGNUP_WITH_THEME,
			theme
		} );

		// `ThemeHelpers.navigateTo` uses `page()` here, which messes with `pushState`,
		// which we don't want here, since we're navigating away from Calypso.
		window.location = signupUrl;
	}
}

// Might be obsolete, since in my-sites/themes, we're using `getUrl()` for Details
export function details( theme, site ) {
	return dispatch => {
		const detailsUrl = ThemeHelpers.getDetailsUrl( theme, site );

		dispatch( {
			type: ActionTypes.THEME_DETAILS,
			theme: theme
		} );

		ThemeHelpers.navigateTo( detailsUrl, site.jetpack );
	}
};

// Might be obsolete, since in my-sites/themes, we're using `getUrl()` for Support
export function support( theme, site ) {
	return dispatch => {
		const supportUrl = ThemeHelpers.getSupportUrl( theme, site );

		dispatch( {
			type: ActionTypes.THEME_SUPPORT,
			theme: theme
		} );

		ThemeHelpers.navigateTo( supportUrl, site.jetpack );
	}
};

export function preview( theme, site ) {
	return dispatch => {
		const previewUrl = ThemeHelpers.getPreviewUrl( theme, site );

		dispatch( {
			type: ActionTypes.PREVIEW_THEME,
			site: site
		} );

		ThemeHelpers.navigateTo( previewUrl, site.jetpack );
	}
}

export function customize( theme, site ) {
	return dispatch => {
		const customizeUrl = ThemeHelpers.getCustomizeUrl( theme, site );

		dispatch( {
			type: ActionTypes.THEME_CUSTOMIZE,
			site: site.id
		} );

		ThemeHelpers.navigateTo( customizeUrl, site.jetpack );
	}
};

export function purchase( theme, site, source = 'unknown' ) {
	const CartActions = require( 'lib/upgrades/actions' );
	const themeItem = require( 'lib/cart-values/cart-items' ).themeItem;

	return dispatch => {
		CartActions.addItem( themeItem( theme.id, source ) );

		defer( () => {
			page( '/checkout/' + site.slug );

			dispatch( {
				type: ActionTypes.PURCHASE_THEME,
				id: theme.id,
				site: site
			} );
		} );
	}
}
