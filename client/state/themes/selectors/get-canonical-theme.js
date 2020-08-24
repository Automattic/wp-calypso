/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getTheme } from 'state/themes/selectors/get-theme';

import 'state/themes/init';

/**
 * Returns a theme object from what is considered the 'canonical' source, i.e.
 * the one with richest information. Checks WP.com (which has a long description
 * and multiple screenshots, and a preview URL) first, then WP.org (which has a
 * preview URL), then the given JP site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Jetpack Site ID to fall back to
 * @param  {string}  themeId Theme ID
 * @returns {?object}         Theme object
 */
export function getCanonicalTheme( state, siteId, themeId ) {
	const source = find( [ 'wpcom', 'wporg', siteId ], ( s ) => getTheme( state, s, themeId ) );
	return getTheme( state, source, themeId );
}
