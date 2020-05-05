/**
 * Internal dependencies
 */
import {
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'state/sites/selectors';

import 'state/themes/init';

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
	return (
		isJetpackSite( state, siteId ) &&
		hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) &&
		! isJetpackSiteMultiSite( state, siteId )
	);
}
