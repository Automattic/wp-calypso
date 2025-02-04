import { getActiveTheme } from 'calypso/state/themes/selectors/get-active-theme';
import type { AppState } from 'calypso/types';

import 'calypso/state/themes/init';

/**
 * Returns whether the Woo Express default theme is currently active on the given site.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme is active on the site
 */
export function isDefaultWooExpressThemeActive( state: AppState, siteId: number ) {
	return getActiveTheme( state, siteId ) === 'tsubaki';
}
