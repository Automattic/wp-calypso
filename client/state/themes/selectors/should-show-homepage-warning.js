/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

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
		state.themes.themeHasAutoLoadingHomepageWarning?.themeId === themeId &&
		state.themes.themeHasAutoLoadingHomepageWarning?.show
	);
}
