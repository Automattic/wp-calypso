import { SELECTED_SITE_SET, MOST_RECENTLY_SELECTED_SITE_SET } from 'calypso/state/action-types';
import 'calypso/state/ui/init';

/**
 * Returns a thunk function that dispatches two actions related to the selected site ID.
 * The dispatched actions have type of MOST_RECENTLY_SELECTED_SITE_SET and SELECTED_SITE_SET where they both pass the new site ID to select.
 * Note that MOST_RECENTLY_SELECTED_SITE_SET is never be null since we can refer to the most recently selected site ID even when no site is selected.
 * @param {number | null} siteId - The ID of the site to be set as selected.
 * @returns {Function} A Redux thunk function.
 */
export const setSelectedSiteId = ( siteId ) => {
	return ( dispatch ) => {
		if ( siteId ) {
			dispatch( {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId,
			} );
		}

		dispatch( {
			type: SELECTED_SITE_SET,
			siteId,
		} );
	};
};

/**
 * Returns an action object to be used in signalling that all sites have been
 * set as selected.
 * @returns {Object} Action object
 */
export const setAllSitesSelected = () => {
	return ( dispatch ) => {
		dispatch( {
			type: SELECTED_SITE_SET,
			siteId: null,
		} );
	};
};
