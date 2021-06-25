/**
 * Internal dependencies
 */
import { getActiveTheme } from 'calypso/state/themes/selectors/get-active-theme';

import 'calypso/state/themes/init';

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
