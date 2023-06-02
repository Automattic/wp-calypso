import { FEATURE_WOOP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

import 'calypso/state/themes/init';

/**
 * Returns true if the site specified has the features needed to use
 * software bundled with themes (like woo-on-plans).
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if the site is able to used bundled software.
 */
export function isSiteEligibleForManagedExternalThemes( state, siteId ) {
	return (
		siteHasFeature( state, siteId, FEATURE_WOOP ) &&
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);
}
