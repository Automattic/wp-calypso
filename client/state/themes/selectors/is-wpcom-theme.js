import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Whether a theme is present in the WordPress.com Theme Directory
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  themeId Theme ID
 * @returns {boolean}         Whether theme is in WP.com theme directory
 */
export function isWpcomTheme( state, themeId ) {
	return !! getTheme( state, 'wpcom', themeId );
}
