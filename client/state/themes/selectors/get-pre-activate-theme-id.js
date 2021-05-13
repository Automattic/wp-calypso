/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

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
	return state.themes.themeHasAutoLoadingHomepageWarning?.themeId;
}
