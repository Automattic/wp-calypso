/**
 * Internal dependencies
 */
import { SELECTED_SITE_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 *
 * @param {number} siteId Site ID
 * @returns {object} Action object
 */
export function setSelectedSiteId( siteId ) {
	return {
		type: SELECTED_SITE_SET,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that all sites have been
 * set as selected.
 *
 * @returns {object} Action object
 */
export function setAllSitesSelected() {
	return {
		type: SELECTED_SITE_SET,
		siteId: null,
	};
}
