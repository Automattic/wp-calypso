/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

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
		state.themes.themeHasAutoLoadingHomepageWarning?.themeId === themeId &&
		state.themes.themeHasAutoLoadingHomepageWarning?.accepted
	);
}
