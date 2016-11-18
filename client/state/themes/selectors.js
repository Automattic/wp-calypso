/** @ssr-ready **/

/**
 * External dependencies
 */
import { includes, isEqual, omit, some, split } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteSlug, getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { isPremiumTheme, oldShowcaseUrl } from './utils';
import {
	getDeserializedThemesQueryDetails,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getSerializedThemesQueryWithoutPage
 } from './utils';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * Returns an array of theme objects by site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site themes
 */
export const getThemes = createSelector(
	( state, siteId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return [];
		}

		return manager.getItems();
	},
	( state ) => state.themes.queries
);

/**
 * Returns a theme object by site ID, theme ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  themeId Theme ID
 * @return {?Object}        Theme object
 */
export const getTheme = createSelector(
	( state, siteId, themeId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);

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

		return themes;
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);

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

		return themes.getItemsIgnoringPage( query );
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
export function isRequestingSiteTheme( state, siteId, themeId ) {
	if ( ! state.themes.themeRequests[ siteId ] ) {
		return false;
	}

	return !! state.themes.themeRequests[ siteId ][ themeId ];
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

	if ( isJetpackSite( state, siteId ) ) {
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
	if ( ! theme || ! isPremiumTheme( theme ) ) {
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
	if ( ! isPremiumTheme( theme ) ) {
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

	if ( isPremiumTheme( theme ) ) {
		url += '&premium=true';
	}

	return url;
}

/**
 * Returns the currently active theme on a given site.
 *
 * DON'T USE YET! This relies on a site object's options.theme_slug attr. If you trigger my-sites' siteSelection
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
	if ( ! siteId ) {
		return null;
	}

	const slug = getSiteOption( state, siteId, 'theme_slug' );

	if ( isJetpackSite( state, siteId ) ) {
		return slug;
	}

	// On WPCOM sites, themes slugs are prefixed with `pub/`, `premium/` etc.
	const slugParts = split( slug, '/', 2 );
	if ( slugParts.length < 2 ) {
		return null;
	}

	return slugParts[ 1 ];
}

/**
 * Returns whether the theme is currently active on the given site.
 *
 * DON'T USE YET! This relies on the getActiveTheme() selector; see its JSDoc.
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
