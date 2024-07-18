import { GLOBALLY_SELECTED_SITE_SET, SELECTED_SITE_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 * @param {number | null} siteId Site ID
 * @returns {{type: string, siteId: number}} Action object
 */
export function setSelectedSiteId( siteId ) {
	return {
		type: SELECTED_SITE_SET,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a site has been set
 * as globally selected.
 * @param {number | null} siteId Site ID
 * @returns {{type: string, siteId: number}} Action object
 */
export function setGloballySelectedSiteId( siteId ) {
	return {
		type: GLOBALLY_SELECTED_SITE_SET,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that all sites have been
 * set as selected.
 * @returns {Object} Action object
 */
export function setAllSitesSelected() {
	return {
		type: SELECTED_SITE_SET,
		siteId: null,
	};
}
