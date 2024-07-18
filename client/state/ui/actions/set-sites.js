import { SELECTED_SITE_SET, PREV_SELECTED_SITE_SET } from 'calypso/state/action-types';
import 'calypso/state/ui/init';
import { getSelectedSiteId } from '../selectors';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 * @param {number | null} siteId Site ID
 * @returns {{type: string, siteId: number}} Action object
 */
export const setSelectedSiteId = ( siteId ) => {
	return ( dispatch, getState ) => {
		const currentState = getState();

		dispatch( {
			type: PREV_SELECTED_SITE_SET,
			value: getSelectedSiteId( currentState ),
		} );

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
	return ( dispatch, getState ) => {
		const currentState = getState();

		dispatch( {
			type: PREV_SELECTED_SITE_SET,
			value: getSelectedSiteId( currentState ),
		} );

		// Then dispatch SELECTED_SITE_SET
		dispatch( {
			type: SELECTED_SITE_SET,
			siteId: null,
		} );
	};
};
