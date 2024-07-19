import { SELECTED_SITE_SET, PREV_SELECTED_SITE_SET } from 'calypso/state/action-types';
import 'calypso/state/ui/init';
import { getSelectedSiteId } from '../selectors';

/**
 * Returns a thunk function that dispatches two actions related to the selected site ID. The
 * dispatched actions have type of PREV_SELECTED_SITE_SET and includes the currently selected site
 * ID from the state, and SELECTED_SITE_SET including the new site ID to select.
 * @param {number | null} siteId - The ID of the site to be set as selected.
 * @returns {Function} A Redux thunk function.
 */
export const setSelectedSiteId = ( siteId ) => {
	return ( dispatch, getState ) => {
		const currentState = getState();

		dispatch( {
			type: PREV_SELECTED_SITE_SET,
			siteId: getSelectedSiteId( currentState ),
		} );

		dispatch( {
			type: SELECTED_SITE_SET,
			siteId,
		} );
	};
};

/**
 * Returns a thunk function that dispatches actions for setting all sites as selected. The
 * dispatched actions have type of PREV_SELECTED_SITE_SET and includes the currently selected site
 * ID from the state, and SELECTED_SITE_SET including a null value for site ID.
 * @returns {Function} A Redux thunk function.
 */
export const setAllSitesSelected = () => {
	return ( dispatch, getState ) => {
		const currentState = getState();

		dispatch( {
			type: PREV_SELECTED_SITE_SET,
			siteId: getSelectedSiteId( currentState ),
		} );

		// Then dispatch SELECTED_SITE_SET
		dispatch( {
			type: SELECTED_SITE_SET,
			siteId: null,
		} );
	};
};
