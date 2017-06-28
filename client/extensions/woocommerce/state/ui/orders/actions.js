/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { WOOCOMMERCE_UI_ORDERS_SET_PAGE } from 'woocommerce/state/action-types';

export const setCurrentPage = ( siteId, page ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	dispatch( {
		type: WOOCOMMERCE_UI_ORDERS_SET_PAGE,
		siteId,
		page,
	} );
};
