/**
 * External dependencies
 */
import { includes, isEqual, omit, some, get, pick, uniq } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	getSiteSlug,
	getSiteOption,
	isJetpackSite,
	canJetpackSiteManage,
	hasJetpackSiteJetpackThemesExtendedFeatures
} from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import {
	getDeserializedThemesQueryDetails,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getSerializedThemesQueryWithoutPage,
	isPremium,
	oldShowcaseUrl
} from './utils';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * Returns a theme object by site ID, theme ID pair.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {String}  themeId Theme ID
 * @return {?Object}         Theme object
 */
export const getTheme = createSelector(
	( state, siteId, themeId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		const theme = manager.getItem( themeId );
		if ( siteId === 'wpcom' || siteId === 'wporg' ) {
			return theme;
		}
		// We're dealing with a Jetpack site. If we have theme info obtained from the
		// WordPress.org API, merge it.
		const wporgTheme = getTheme( state, 'wporg', themeId );
		if ( ! wporgTheme ) {
			return theme;
		}
		return {
			...theme,
			...pick( wporgTheme, [ 'demo_uri', 'download', 'taxonomies' ] )
		};
	},
	( state ) => state.themes.queries
);

/**
 * Returns theme request error object
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID
 * @return {Object}          error object if present or null otherwise
 */
export function getThemeRequestErrors( state, themeId, siteId ) {
	return get( state.themes.themeRequestErrors, [ siteId, themeId ], null );
}

/**
 * Returns an array of normalized themes for the themes query, or null if no
 * themes have been received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Array}         Themes for the theme query
 */
export const getThemesForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		const themes = manager.getItems( query );
		if ( ! themes ) {
			return null;
		}

		// ThemeQueryManager will return an array including undefined entries if
		// it knows that a page of results exists for the query (via a previous
		// request's `found` value) but the items haven't been received. While
		// we could impose this on the developer to accommodate, instead we
		// simply return null when any `undefined` entries exist in the set.
		if ( includes( themes, undefined ) ) {
			return null;
		}

		// FIXME: The themes endpoint weirdly sometimes returns duplicates (spread
		// over different pages) which we need to remove manually here for now.
		return uniq( themes );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);

/**
 * Returns last query used.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}         Last query
 */
export function getLastThemeQuery( state, siteId ) {
	return get( state.themes.lastQuery, siteId, {} );
}

/**
 * Returns true if currently requesting themes for the themes query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {Boolean}        Whether themes are being requested
 */
export function isRequestingThemesForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedThemesQuery( query, siteId );
	return !! state.themes.queryRequests[ serializedQuery ];
}

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable themes if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Number}        Total number of found items
 */
export function getThemesFoundForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	return state.themes.queries[ siteId ].getFound( query );
}

/**
 * Returns the last queryable page of themes for the given query, or null if the
 * total number of queryable themes if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Number}        Last themes page
 */
export function getThemesLastPageForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	const pages = state.themes.queries[ siteId ].getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	// No pagination on Jetpack sites -- everything is returned at once, i.e. on one page
	if ( isJetpackSite( state, siteId ) ) {
		return 1;
	}

	return Math.max( pages, 1 );
}

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable themes if unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @param  {Object}   query  Theme query object
 * @return {?Boolean}        Whether last themes page has been reached
 */
export function isThemesLastPageForQuery( state, siteId, query = {} ) {
	const lastPage = getThemesLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === ( query.page || DEFAULT_THEME_QUERY.page );
}

/**
 * Returns an array of normalized themes for the themes query, including all
 * known queried pages, or null if the themes for the query are not known.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Array}         Themes for the theme query
 */
export const getThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const themes = state.themes.queries[ siteId ];
		if ( ! themes ) {
			return null;
		}

		const themesForQueryIgnoringPage = themes.getItemsIgnoringPage( query );
		if ( ! themesForQueryIgnoringPage ) {
			return null;
		}

		// FIXME: The themes endpoint weirdly sometimes returns duplicates (spread
		// over different pages) which we need to remove manually here for now.
		return uniq( themesForQueryIgnoringPage );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQueryWithoutPage( query, siteId )
);

/**
 * Returns true if currently requesting themes for the themes query, regardless
 * of page, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {Boolean}        Whether themes are being requested
 */
export const isRequestingThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedThemesQuery( query ), 'page' );
		return some( state.themes.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedThemesQueryDetails( serializedQuery );
			if ( queryDetails.siteId !== siteId ) {
				return false;
			}

			return isEqual(
				normalizedQueryWithoutPage,
				omit( queryDetails.query, 'page' )
			);
		} );
	},
	( state ) => state.themes.queryRequests,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);

/**
 * Returns true if a request is in progress for the specified site theme, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}        Whether request is in progress
 */
export function isRequestingTheme( state, siteId, themeId ) {
	if ( ! state.themes.themeRequests[ siteId ] ) {
		return false;
	}

	return !! state.themes.themeRequests[ siteId ][ themeId ];
}

/**
 * Returns true if a request is in progress for the site active theme, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether request is in progress
 */
export function isRequestingActiveTheme( state, siteId ) {
	return get( state.themes.activeThemeRequests, siteId, false );
}

/**
 * Whether a theme is present in the WordPress.org Theme Directory
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}         Whether theme is in WP.org theme directory
 */
export function isWporgTheme( state, themeId ) {
	return !! getTheme( state, 'wporg', themeId );
}

/**
 * Returns the URL for a given theme's details sheet.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme details sheet URL
 */
export function getThemeDetailsUrl( state, theme, siteId ) {
	if ( ! theme ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) &&
		! (
			config.isEnabled( 'manage/themes/details/jetpack' ) &&
			canJetpackSiteManage( state, siteId ) &&
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId )
		) ) {
		return getSiteOption( state, siteId, 'admin_url' ) + 'themes.php?theme=' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme setup instructions URL
 */
export function getThemeSupportUrl( state, theme, siteId ) {
	if ( isJetpackSite( state, siteId ) || ! theme || ! isThemePremium( state, theme.id ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		return `/theme/${ theme.id }/setup${ sitePart }`;
	}

	return `${ oldShowcaseUrl }${ sitePart }${ theme.id }/support`;
}

/**
 * Returns the URL for a given theme's support page.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme support page URL
 */
export function getThemeHelpUrl( state, theme, siteId ) {
	if ( ! theme || isJetpackSite( state, siteId ) ) {
		return null;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }/support`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for purchasing the given theme for the given site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {Number}  siteId Site ID for which to buy the theme
 * @return {?String}        Theme purchase URL
 */
export function getThemePurchaseUrl( state, theme, siteId ) {
	if ( isJetpackSite( state, siteId ) || ! isThemePremium( state, theme.id ) ) {
		return null;
	}

	return `/checkout/${ getSiteSlug( state, siteId ) }/theme:${ theme.id }`;
}

/**
 * Returns the URL for opening the customizer with the given theme on the given site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {?Object}  theme  Theme object
 * @param  {?Number}  siteId Site ID to open the customizer for
 * @return {?String}         Customizer URL
 */
export function getThemeCustomizeUrl( state, theme, siteId ) {
	if ( ! siteId ) {
		return '/customize/';
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteOption( state, siteId, 'admin_url' ) +
			'customize.php?return=' +
			encodeURIComponent( window.location ) +
			( theme ? '&theme=' + theme.id : '' );
	}

	const customizeUrl = '/customize/' + getSiteSlug( state, siteId );

	if ( theme && theme.stylesheet ) {
		return customizeUrl + '?theme=' + theme.stylesheet;
	}

	return customizeUrl;
}

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @return {?String}        Signup URL
 */
export function getThemeSignupUrl( state, theme ) {
	if ( ! theme ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + theme.id;

	if ( isThemePremium( state, theme.id ) ) {
		url += '&premium=true';
	}

	return url;
}

/**
 * Returns the URL for a premium theme's dedicated forum, or for the general themes
 * forum for a free theme.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {String}  siteId  Site ID
 * @return {?String}         Theme forum URL
 */
export function getThemeForumUrl( state, themeId, siteId ) {
	if ( isJetpackSite( state, siteId ) ) {
		if ( isWporgTheme( state, themeId ) ) {
			return '//wordpress.org/support/theme/' + themeId;
		}
		return null;
	}

	if ( isThemePremium( state, themeId ) ) {
		return '//premium-themes.forums.wordpress.com/forum/' + themeId;
	}
	return '//en.forums.wordpress.com/forum/themes';
}

/**
 * Returns the currently active theme on a given site.
 *
 * This selector previously worked using data from sites subtree.
 * This information is now double, see following explanation: If you trigger my-sites' siteSelection
 * middleware during theme activation, it will fetch the current site fresh from the API even though that
 * theme_slug attr might not have been updated on the server yet -- and you'll end up with the old themeId!
 * This happens in particular after purchasing a premium theme in single-site mode since after a theme purchase,
 * the checkout-thank-you component always redirects to the theme showcase for the current site.
 * One possible fix would be to get rid of that redirect (related: https://github.com/Automattic/wp-calypso/issues/8262).
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {?String}         Theme ID
 */
export function getActiveTheme( state, siteId ) {
	return get( state.themes.activeThemes, siteId, null );
}

/**
 * Returns whether the theme is currently active on the given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if the theme is active on the site
 */
export function isThemeActive( state, themeId, siteId ) {
	return getActiveTheme( state, siteId ) === themeId;
}

/**
 * Returns whether the theme activation action is currently ongoing on the site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if theme activation is ongoing
 */
export function isActivatingTheme( state, siteId ) {
	return get( state.themes.activationRequests, siteId, false );
}

/**
 * Returns whether the theme activation action has finished on the site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if the theme activation has finished
 */
export function hasActivatedTheme( state, siteId ) {
	return get( state.themes.completedActivationRequests, siteId, false );
}

/**
 * Whether the theme is currently being installed on the (Jetpack) site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if theme installation is ongoing
 */
export function isInstallingTheme( state, siteId ) {
	return get( state.themes.themeInstalls, siteId, false );
}

/**
 * Whether a WPCOM theme given by its ID is premium.
 *
 * @param  {Object} state   Global state tree
 * @param  {Object} themeId Theme ID
 * @return {Boolean}        True if the theme is premium
 */
export function isThemePremium( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	return isPremium( theme );
}

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if the theme has been purchased for the site
 */
export function isThemePurchased( state, themeId, siteId ) {
	const sitePurchases = getSitePurchases( state, siteId );
	return some( sitePurchases, { productSlug: 'premium_theme', meta: themeId } );
}
