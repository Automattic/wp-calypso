/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

export const setCurrentQuery = ( siteId, query ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	dispatch( {
		type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
		siteId,
		query,
	} );
};
