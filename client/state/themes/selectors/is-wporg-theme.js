import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Whether a theme is present in the WordPress.org Theme Directory
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  themeId Theme ID
 * @returns {boolean}         Whether theme is in WP.org theme directory
 */
export function isWporgTheme( state, themeId ) {
	return !! getTheme( state, 'wporg', themeId );
}
