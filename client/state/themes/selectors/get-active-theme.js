/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

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
	const activeTheme = state.themes.activeThemes[ siteId ] ?? null;
	// If the theme ID is suffixed with -wpcom, remove that string. This is because
	// we want to treat WP.com themes identically, whether or not they're installed
	// on a given Jetpack site (where the -wpcom suffix would be appended).
	return activeTheme && activeTheme.replace( '-wpcom', '' );
}
