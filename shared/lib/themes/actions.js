/**
 * External dependencies
 */
import page from 'page';
import defer from 'lodash/function/defer';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
import ThemeConstants from 'lib/themes/constants';
import ThemeHelpers from './helpers';
import {
	getThemeById,
	getCurrentTheme,
	getQueryParams,
	isJetpack
} from './selectors';
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
		type: ThemeConstants.QUERY_THEMES,
		params: params
	};
}

export function incrementThemesPage( site ) {
	return {
		type: ThemeConstants.INCREMENT_THEMES_PAGE,
		site: site
	}
}

export function fetchCurrentTheme( site ) {
	return dispatch => {
		const callback = ( error, data ) => {
			debug( 'Received current theme', data );
			if ( ! error ) {
				dispatch( {
					type: ThemeConstants.RECEIVE_CURRENT_THEME,
					site: site,
					themeId: data.id,
					themeName: data.name
				} );
			}
		};
		wpcom.undocumented().activeTheme( site.ID, callback );
	};
}

export function receiveServerError( error ) {
	return {
		type: ThemeConstants.RECEIVE_THEMES_SERVER_ERROR,
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
			type: ThemeConstants.RECEIVE_THEMES,
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
			type: ThemeConstants.ACTIVATE_THEME,
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
			type: ThemeConstants.ACTIVATED_THEME,
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
		type: ThemeConstants.CLEAR_ACTIVATED_THEME
	};
};

// Might be obsolete, since in theme-options.js, `hasUrl === true`
export function details( theme, site ) {
	return dispatch => {
		const detailsUrl = ThemeHelpers.getDetailsUrl( theme, site );

		dispatch( {
			type: ThemeConstants.THEME_DETAILS,
			theme: theme
		} );

		ThemeHelpers.navigateTo( detailsUrl, site.jetpack );
	}
};

// Might be obsolete, since in theme-options.js, `hasUrl === true`
export function support( theme, site ) {
	return dispatch => {
		const supportUrl = ThemeHelpers.getSupportUrl( theme, site );

		dispatch( {
			type: ThemeConstants.THEME_SUPPORT,
			theme: theme
		} );

		ThemeHelpers.navigateTo( supportUrl, site.jetpack );
	}
};

export function preview( theme, site ) {
	return dispatch => {
		const previewUrl = ThemeHelpers.getPreviewUrl( theme, site );

		dispatch( {
			type: ThemeConstants.PREVIEW_THEME,
			site: site
		} );

		ThemeHelpers.navigateTo( previewUrl, site.jetpack );
	}
}

export function customize( theme, site ) {
	return dispatch => {
		const customizeUrl = ThemeHelpers.getCustomizeUrl( theme, site );

		dispatch( {
			type: ThemeConstants.THEME_CUSTOMIZE,
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
				type: ThemeConstants.PURCHASE_THEME,
				id: theme.id,
				site: site
			} );
		} );
	}
}
