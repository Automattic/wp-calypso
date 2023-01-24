import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isSiteEligibleForBundledSoftware } from 'calypso/state/themes/selectors/is-site-eligible-for-bundled-software';

import 'calypso/state/themes/init';

/**
 * Returns true if the theme contains a software bundle (like woo-on-plans) and
 * the site specified has the features needed to use the software.
 *
 * @param {Object} state Global state tree
 * @param {string} themeId Theme ID
 * @param {number} siteId Site ID
 * @returns {boolean} True if the theme contains a software bundle that is usable by the specified site.
 */
export function doesThemeBundleUsableSoftwareSet( state, themeId, siteId ) {
	return (
		doesThemeBundleSoftwareSet( state, themeId ) &&
		isSiteEligibleForBundledSoftware( state, siteId )
	);
}
