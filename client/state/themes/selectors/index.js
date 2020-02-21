/**
 * External dependencies
 */
import { includes, intersection, some, get } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	getCustomizerUrl,
	getSiteSlug,
	isJetpackSite,
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSiteMultiSite,
} from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { getThemeTaxonomySlugs, oldShowcaseUrl } from 'state/themes/utils';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import { getTheme } from 'state/themes/selectors/get-theme';
import { getCanonicalTheme } from 'state/themes/selectors/get-canonical-theme';
import { isWpcomTheme } from 'state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'state/themes/selectors/is-wporg-theme';
import { isThemePremium } from 'state/themes/selectors/is-theme-premium';

import 'state/themes/init';

export { getTheme } from 'state/themes/selectors/get-theme';
export { getCanonicalTheme } from 'state/themes/selectors/get-canonical-theme';
export { isInstallingTheme } from 'state/themes/selectors/is-installing-theme';
export { getThemeRequestErrors } from 'state/themes/selectors/get-theme-request-errors';
export { getThemesForQuery } from 'state/themes/selectors/get-themes-for-query';
export { getLastThemeQuery } from 'state/themes/selectors/get-last-theme-query';
export { isRequestingThemesForQuery } from 'state/themes/selectors/is-requesting-themes-for-query';
export { getThemesFoundForQuery } from 'state/themes/selectors/get-themes-found-for-query';
export { getThemesLastPageForQuery } from 'state/themes/selectors/get-themes-last-page-for-query';
export { isThemesLastPageForQuery } from 'state/themes/selectors/is-themes-last-page-for-query';
export { getThemesForQueryIgnoringPage } from 'state/themes/selectors/get-themes-for-query-ignoring-page';
export { isRequestingThemesForQueryIgnoringPage } from 'state/themes/selectors/is-requesting-themes-for-query-ignoring-page';
export { isRequestingTheme } from 'state/themes/selectors/is-requesting-theme';
export { isRequestingActiveTheme } from 'state/themes/selectors/is-requesting-active-theme';
export { isWpcomTheme } from 'state/themes/selectors/is-wpcom-theme';
export { isWporgTheme } from 'state/themes/selectors/is-wporg-theme';
export { getThemeDetailsUrl } from 'state/themes/selectors/get-theme-details-url';
export { isThemePremium } from 'state/themes/selectors/is-theme-premium';

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme setup instructions URL
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
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme support page URL
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
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID for which to buy the theme
 * @returns {?string}         Theme purchase URL
 */
export function getThemePurchaseUrl( state, themeId, siteId ) {
	if ( isJetpackSite( state, siteId ) || ! isThemePremium( state, themeId ) ) {
		return null;
	}
	return `/checkout/${ getSiteSlug( state, siteId ) }/theme:${ themeId }`;
}

/**
 * Returns the URL for opening the customizer with the given theme on the given site.
 *
 * @param  {object}   state   Global state tree
 * @param  {string}   themeId Theme ID
 * @param  {?number}  siteId  Site ID to open the customizer for
 * @returns {?string}          Customizer URL
 */
export function getThemeCustomizeUrl( state, themeId, siteId ) {
	const customizerUrl = getCustomizerUrl( state, siteId );

	if ( ! ( siteId && themeId ) || isThemeActive( state, themeId, siteId ) ) {
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
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Signup URL
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
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {string}  siteId  Site ID
 * @returns {?string}         Theme forum URL
 */
export function getThemeDemoUrl( state, themeId, siteId ) {
	const theme = getCanonicalTheme( state, siteId, themeId );
	return get( theme, 'demo_uri' );
}

/**
 * Returns the URL for a premium theme's dedicated forum, or for the general themes
 * forum for a free theme.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Theme forum URL
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
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {?string}         Theme ID
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
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme is active on the site
 */
export function isThemeActive( state, themeId, siteId ) {
	return getActiveTheme( state, siteId ) === themeId;
}

/**
 * Returns whether the theme activation action is currently ongoing on the site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if theme activation is ongoing
 */
export function isActivatingTheme( state, siteId ) {
	return get( state.themes.activationRequests, siteId, false );
}

/**
 * Returns whether the theme activation action has finished on the site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme activation has finished
 */
export function hasActivatedTheme( state, siteId ) {
	return get( state.themes.completedActivationRequests, siteId, false );
}

/**
 * Whether a WPCOM premium theme can be activated on a site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check availability
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the premium theme is available for the given site
 */
export function isPremiumThemeAvailable( state, themeId, siteId ) {
	return (
		isThemePurchased( state, themeId, siteId ) ||
		hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
	);
}

/**
 * Whether a given theme is installed or can be installed on a Jetpack site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check availability
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if siteId is a Jetpack site on which theme is installed or can be installed.
 */
export function isThemeAvailableOnJetpackSite( state, themeId, siteId ) {
	return (
		!! getTheme( state, siteId, themeId ) || // The theme is already available or...
		( isWpcomTheme( state, themeId ) && // ...it's a WP.com theme and...
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) ) // ...the site supports theme installation from WP.com.
	);
}

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme has been purchased for the site
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
 * @param  {object}  state Global state tree
 * @returns {?string}  ThemePreview state
 */
export function themePreviewVisibility( state ) {
	return get( state.themes, 'themePreviewVisibility', null );
}

/**
 * Returns id of the parent theme, if any, for a wpcom theme.
 *
 * @param {object} state Global state tree
 * @param {string} themeId Child theme ID
 *
 * @returns {?string} Parent theme id if it exists
 */
export function getWpcomParentThemeId( state, themeId ) {
	return get( getTheme( state, 'wpcom', themeId ), 'template', null );
}

/**
 * Determine whether a zip of a given theme is hosted on
 * wpcom for download.
 *
 * @param {object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {boolean} true if zip is available on wpcom
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
 * @param {object} state Global state tree
 * @param {number} siteId The Site ID
 * @returns {boolean} true if wpcom themes should be removed
 */
export function shouldFilterWpcomThemes( state, siteId ) {
	return (
		isJetpackSite( state, siteId ) &&
		hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) &&
		! isJetpackSiteMultiSite( state, siteId )
	);
}

/**
 * Returns the URL for purchasing a Jetpack Professional plan if the theme is a premium theme and site doesn't have access to them.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme to check whether it's premium.¡
 * @param  {number}  siteId  Site ID for which to purchase the plan
 * @returns {?string}         Plan purchase URL
 */
export function getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId ) {
	if (
		isJetpackSite( state, siteId ) &&
		isThemePremium( state, themeId ) &&
		! hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
	) {
		return `/checkout/${ getSiteSlug( state, siteId ) }/professional`;
	}
	return null;
}

/**
 * Returns the price string to display for a given theme on a given site.
 *
 * TODO Add tests!
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {string}          Price
 */
export function getPremiumThemePrice( state, themeId, siteId ) {
	if ( ! isThemePremium( state, themeId ) || isPremiumThemeAvailable( state, themeId, siteId ) ) {
		return '';
	}

	if ( isJetpackSite( state, siteId ) ) {
		return i18n.translate( 'Upgrade', {
			comment:
				'Used to indicate a premium theme is available to the user once they upgrade their plan',
		} );
	}

	const theme = getTheme( state, 'wpcom', themeId );
	return get( theme, 'price' );
}

/**
 * Checks if a theme should be customized primarily with Gutenberg.
 *
 * Examples include Template First Themes, which can be determined by the feature
 * global-styles or auto-loading-homepage.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId An identifier for the theme - like
 *                         `independent-publisher-2` or `maywood`.
 * @returns {boolean} True if the theme should be edited with gutenberg.
 */
export function isThemeGutenbergFirst( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const themeFeatures = getThemeTaxonomySlugs( theme, 'theme_feature' );
	const neededFeatures = [ 'global-styles', 'auto-loading-homepage' ];
	// The theme should have a positive number of matching features to qualify.
	return !! intersection( themeFeatures, neededFeatures ).length;
}

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {object} state Global state tree
 *
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state ) {
	return state.themes.recommendedThemes.themes || emptyList;
}

/**
 * Returns whether the recommended themes list is loading.
 *
 * @param {object} state Global state tree
 *
 * @returns {boolean} whether the recommended themes list is loading
 */
export function areRecommendedThemesLoading( state ) {
	return state.themes.recommendedThemes.isLoading;
}

/**
 * Checks if a theme has auto loading homepage feature.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId An identifier for the theme
 * @returns {boolean} True if the theme has auto loading homepage. Otherwise, False.
 */
export function themeHasAutoLoadingHomepage( state, themeId ) {
	return includes(
		getThemeTaxonomySlugs( getTheme( state, 'wpcom', themeId ), 'theme_feature' ),
		'auto-loading-homepage'
	);
}

/**
 * Return the theme ID of the theme BEFORE to activated it.
 * It allows getting the possibility to take action when it's needed.
 * Specifically, it helps to show a modal when the theme to activate
 * will change the homepage of the site, usually,
 * this feature is included in First-Template Themes.
 *
 * @param {object} state   Global state tree
 * @returns {string} Theme ID,
 */
export function getPreActivateThemeId( state ) {
	return get( state.themes, [ 'themeHasAutoLoadingHomepageWarning', 'themeId' ] );
}

/**
 * Returns whether the auto loading homepage modal should be shown
 * before to start to install theme.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId Theme ID used to show the warning message before to activate.
 * @returns {boolean}      True it should show the auto loading modal. Otherwise, False.
 */
export function shouldShowHomepageWarning( state, themeId ) {
	return (
		get( state.themes, [ 'themeHasAutoLoadingHomepageWarning', 'themeId' ] ) === themeId &&
		get( state.themes, [ 'themeHasAutoLoadingHomepageWarning', 'show' ] )
	);
}

/**
 * Returns whether the auto loading homepage modal has been
 * accepted by the user, which means that the theme
 * will be activated.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId Theme ID to activate in the site.
 * @returns {boolean}      True if the auto loading homepage dialog has been accepted. Otherwise, False.
 */
export function hasAutoLoadingHomepageModalAccepted( state, themeId ) {
	return (
		get( state.themes, [ 'themeHasAutoLoadingHomepageWarning', 'themeId' ] ) === themeId &&
		get( state.themes, [ 'themeHasAutoLoadingHomepageWarning', 'accepted' ] )
	);
}
