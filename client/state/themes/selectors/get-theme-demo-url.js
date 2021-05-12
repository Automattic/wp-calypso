/**
 * Internal dependencies
 */
import { getCanonicalTheme } from 'calypso/state/themes/selectors/get-canonical-theme';

import 'calypso/state/themes/init';

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
	return theme?.demo_uri;
}
