/**
 * External dependencies
 */
import { find, includes, isEqual, omit, some, get, uniq } from 'lodash';
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
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSiteMultiSite,
} from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { getCustomizerUrl } from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	getDeserializedThemesQueryDetails,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getSerializedThemesQueryWithoutPage,
	isPremium,
	oldShowcaseUrl
} from './utils';
import { DEFAULT_THEME_QUERY } from './constants';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

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

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);

/**
 * Returns a theme object from what is considered the 'canonical' source, i.e.
 * the one with richest information. Checks WP.com (which has a long description
 * and multiple screenshots, and a preview URL) first, then WP.org (which has a
 * preview URL), then the given JP site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Jetpack Site ID to fall back to
 * @param  {String}  themeId Theme ID
 * @return {?Object}         Theme object
 */
export function getCanonicalTheme( state, siteId, themeId ) {
	const source = find( [ 'wpcom', 'wporg', siteId ], s => getTheme( state, s, themeId ) );
	return getTheme( state, source, themeId );
}

/**
 * When wpcom themes are installed on Jetpack sites, the
 * theme id is suffixed with -wpcom. Some operations require
 * the use of this suffixed ID. This util function adds the
 * suffix if the site is jetpack and the theme is not yet
 * installed on the site.
 *
 * @param {Object} state	Global state tree
 * @param {String} themeId	Theme ID
 * @param {Number} siteId	Site ID
 * @return {String} 		Potentially suffixed theme ID
 */
const getSuffixedThemeId = ( state, themeId, siteId ) => {
	const siteIsJetpack = siteId && isJetpackSite( state, siteId );
	if ( siteIsJetpack && ! getTheme( state, siteId, themeId ) ) {
		return `${ themeId }-wpcom`;
	}
	return themeId;
};

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
 * Whether a theme is present in the WordPress.com Theme Directory
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}         Whether theme is in WP.com theme directory
 */
export function isWpcomTheme( state, themeId ) {
	return !! getTheme( state, 'wpcom', themeId );
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
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {?Number} siteId  Site ID to optionally use as context
 * @return {?String}         Theme details sheet URL
 */
export function getThemeDetailsUrl( state, themeId, siteId ) {
	if ( ! themeId ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) &&
		! (
			config.isEnabled( 'manage/themes/details/jetpack' ) &&
			canJetpackSiteManage( state, siteId ) &&
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId )
		) ) {
		return getSiteOption( state, siteId, 'admin_url' ) + 'themes.php?theme=' + themeId;
	}

	let baseUrl = oldShowcaseUrl + themeId;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ themeId }`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {?Number} siteId  Site ID to optionally use as context
 * @return {?String}         Theme setup instructions URL
 */
export function getThemeSupportUrl( state, themeId, siteId ) {
	if ( ! themeId || ! isThemePremium( state, themeId ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		return `/theme/${ themeId }/setup${ sitePart }`;
	}

	return `${ oldShowcaseUrl }${ sitePart }${ themeId }/support`;
}

/**
 * Returns the URL for a given theme's support page.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {?Number} siteId  Site ID to optionally use as context
 * @return {?String}         Theme support page URL
 */
export function getThemeHelpUrl( state, themeId, siteId ) {
	if ( ! themeId ) {
		return null;
	}

	let baseUrl = oldShowcaseUrl + themeId;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ themeId }/support`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for purchasing the given theme for the given site.
 * If the site is a Jetpack site, return the plans URL.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID for which to buy the theme
 * @return {?String}         Theme purchase URL
 */
export function getThemePurchaseUrl( state, themeId, siteId ) {
	if ( ! isThemePremium( state, themeId ) ) {
		return null;
	}
	if ( config.isEnabled( 'jetpack/pijp' ) && isJetpackSite( state, siteId ) ) {
		return `/plans/${ getSiteSlug( state, siteId ) }`;
	}
	return `/checkout/${ getSiteSlug( state, siteId ) }/theme:${ themeId }`;
}

/**
 * Returns the URL for opening the customizer with the given theme on the given site.
 *
 * @param  {Object}   state   Global state tree
 * @param  {String}   themeId Theme ID
 * @param  {?Number}  siteId  Site ID to open the customizer for
 * @return {?String}          Customizer URL
 */
export function getThemeCustomizeUrl( state, themeId, siteId ) {
	const customizerUrl = getCustomizerUrl( state, siteId );

	if ( ! ( siteId && themeId ) || isThemeActive( state, themeId, siteId ) ) {
		return customizerUrl;
	}

	const separator = includes( customizerUrl, '?' ) ? '&' : '?';
	let identifier;

	if ( isJetpackSite( state, siteId ) ) {
		identifier = themeId;
	} else {
		const theme = getTheme( state, 'wpcom', themeId );
		if ( ! theme ) {
			return customizerUrl;
		}
		identifier = theme.stylesheet;
	}

	return customizerUrl + separator + 'theme=' + identifier;
}

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @return {?String}         Signup URL
 */
export function getThemeSignupUrl( state, themeId ) {
	if ( ! themeId ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + themeId;

	if ( isThemePremium( state, themeId ) ) {
		url += '&premium=true';
	}

	return url;
}

/**
 * Returns the URL for a theme's demo.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {String}  siteId  Site ID
 * @return {?String}         Theme forum URL
 */
export function getThemeDemoUrl( state, themeId, siteId ) {
	const theme = getCanonicalTheme( state, siteId, themeId );
	return get( theme, 'demo_uri' );
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
export function getThemeForumUrl( state, themeId ) {
	if ( isThemePremium( state, themeId ) ) {
		return '//premium-themes.forums.wordpress.com/forum/' + themeId;
	}
	if ( isWpcomTheme( state, themeId ) ) {
		return '//en.forums.wordpress.com/forum/themes';
	}
	if ( isWporgTheme( state, themeId ) ) {
		return '//wordpress.org/support/theme/' + themeId;
	}
	return null;
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
	const activeTheme = get( state.themes.activeThemes, siteId, null );
	// If the theme ID is suffixed with -wpcom, remove that string. This is because
	// we want to treat WP.com themes identically, whether or not they're installed
	// on a given Jetpack site (where the -wpcom suffix would be appended).
	return activeTheme && activeTheme.replace( '-wpcom', '' );
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
 * @param  {String}  themeId Theme ID for which we check installing state
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if theme installation is ongoing
 */
export function isInstallingTheme( state, themeId, siteId ) {
	const suffixedThemeId = getSuffixedThemeId( state, themeId, siteId );
	return get( state.themes.themeInstalls, [ siteId, suffixedThemeId ], false );
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
 * Whether a WPCOM premium theme can be activated on a site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID for which we check availability
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}        True if the premium theme is available for the given site
 */
export function isPremiumThemeAvailable( state, themeId, siteId ) {
	return isThemePurchased( state, themeId, siteId ) ||
		hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES );
}

/**
 * Whether a given theme is installed or can be installed on a Jetpack site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID for which we check availability
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if siteId is a Jetpack site on which theme is installed or can be installed.
 */
export function isThemeAvailableOnJetpackSite( state, themeId, siteId ) {
	return !! getTheme( state, siteId, themeId ) || ( // The theme is already available or...
		isWpcomTheme( state, themeId ) && (  // ...it's a WP.com theme and...
			config.isEnabled( 'manage/themes/upload' ) &&
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) // ...the site supports theme installation from WP.com.
		)
	);
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

export function getThemePreviewThemeOptions( state ) {
	return get( state.themes, 'themePreviewOptions', {} );
}

/**
 * Returns the ThemePreview state
 *
 * @param  {Object}  state Global state tree
 * @return {?String}  ThemePreview state
 */
export function themePreviewVisibility( state ) {
	return get( state.themes, 'themePreviewVisibility', null );
}

/**
 * Returns id of the parent theme, if any, for a wpcom theme.
 *
 * @param {Object} state Global state tree
 * @param {string} themeId Child theme ID
 *
 * @return {?string} Parent theme id if it exists
 */
export function getWpcomParentThemeId( state, themeId ) {
	return get( getTheme( state, 'wpcom', themeId ), 'template', null );
}

/**
 * Determine whether a zip of a given theme is hosted on
 * wpcom for download.
 *
 * @param {Object} state Global state tree
 * @param {string} themeId Theme ID
 * @return {boolean} true if zip is available on wpcom
 */
export function isDownloadableFromWpcom( state, themeId ) {
	const downloadUri = get( getTheme( state, 'wpcom', themeId ), 'download', '' );
	return !! includes( downloadUri, 'wordpress.com' );
}

/**
 * Determine whether wpcom themes should be removed from
 * a queried list of themes. For jetpack sites with the
 * required capabilities, we hide wpcom themes from the
 * list of locally installed themes.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId The Site ID
 * @returns {boolean} true if wpcom themes should be removed
 */
export function shouldFilterWpcomThemes( state, siteId ) {
	return (
		isJetpackSite( state, siteId ) &&
		config.isEnabled( 'manage/themes/upload' ) &&
		hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) &&
		! isJetpackSiteMultiSite( state, siteId )
	);
}
