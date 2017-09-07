/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	WOOCOMMERCE_UI_ORDERS_CLEAR,
	WOOCOMMERCE_UI_ORDERS_EDIT,
	WOOCOMMERCE_UI_ORDERS_SET_QUERY,
} from 'woocommerce/state/action-types';

export const clearOrder = ( siteId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	dispatch( {
		type: WOOCOMMERCE_UI_ORDERS_CLEAR,
		siteId,
	} );
};

export const editOrder = ( siteId, order ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	dispatch( {
		type: WOOCOMMERCE_UI_ORDERS_EDIT,
		siteId,
		order,
	} );
};

export const updateCurrentOrdersQuery = ( siteId, query ) => ( dispatch, getState ) => {
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
