import { WPCOM_FEATURES_PARTNER_THEMES } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

import 'calypso/state/themes/init';

/**
 * Returns true if the site's plan allows it to use externally managed (partner) themes.
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if the site is able to use externally managed themes.
 */
export function isSiteEligibleForManagedExternalThemes( state, siteId ) {
	return siteHasFeature( state, siteId, WPCOM_FEATURES_PARTNER_THEMES );
}
