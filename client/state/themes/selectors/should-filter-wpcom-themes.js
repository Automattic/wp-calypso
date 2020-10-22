/**
 * Internal dependencies
 */
import { isJetpackSite, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';

import 'calypso/state/themes/init';

/**
 * Determine whether wpcom themes should be removed from
 * a queried list of themes. For jetpack sites with the
 * required capabilities, we hide wpcom themes from the
 * list of locally installed themes.
 *
 * @param {object} state Global state tree
 * @param {number} siteId The Site ID
 * @returns {boolean} true if wpcom themes should be removed
 */
export function shouldFilterWpcomThemes( state, siteId ) {
	return isJetpackSite( state, siteId ) && ! isJetpackSiteMultiSite( state, siteId );
}
