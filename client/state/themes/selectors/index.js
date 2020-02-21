/**
 * External dependencies
 */
import { includes, intersection, get } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { getThemeTaxonomySlugs } from 'state/themes/utils';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import { getTheme } from 'state/themes/selectors/get-theme';
import { isThemePremium } from 'state/themes/selectors/is-theme-premium';
import { isPremiumThemeAvailable } from 'state/themes/selectors/is-premium-theme-available';

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
export { getThemeSupportUrl } from 'state/themes/selectors/get-theme-support-url';
export { getThemeHelpUrl } from 'state/themes/selectors/get-theme-help-url';
export { getThemePurchaseUrl } from 'state/themes/selectors/get-theme-purchase-url';
export { getActiveTheme } from 'state/themes/selectors/get-active-theme';
export { isThemeActive } from 'state/themes/selectors/is-theme-active';
export { getThemeCustomizeUrl } from 'state/themes/selectors/get-theme-customize-url';
export { getThemeSignupUrl } from 'state/themes/selectors/get-theme-signup-url';
export { getThemeDemoUrl } from 'state/themes/selectors/get-theme-demo-url';
export { getThemeForumUrl } from 'state/themes/selectors/get-theme-forum-url';
export { isActivatingTheme } from 'state/themes/selectors/is-activating-theme';
export { hasActivatedTheme } from 'state/themes/selectors/has-activated-theme';
export { isThemePurchased } from 'state/themes/selectors/is-theme-purchased';
export { isPremiumThemeAvailable } from 'state/themes/selectors/is-premium-theme-available';
export { isThemeAvailableOnJetpackSite } from 'state/themes/selectors/is-theme-available-on-jetpack-site';
export { getThemePreviewThemeOptions } from 'state/themes/selectors/get-theme-preview-theme-options';
export { themePreviewVisibility } from 'state/themes/selectors/theme-preview-visibility';
export { getWpcomParentThemeId } from 'state/themes/selectors/get-wpcom-parent-theme-id';
export { isDownloadableFromWpcom } from 'state/themes/selectors/is-downloadable-from-wpcom';
export { shouldFilterWpcomThemes } from 'state/themes/selectors/should-filter-wpcom-themes';

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
