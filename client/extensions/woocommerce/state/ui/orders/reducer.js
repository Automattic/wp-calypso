/**
 * External dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { WOOCOMMERCE_UI_ORDERS_SET_PAGE } from 'woocommerce/state/action-types';

/**
 * Tracks the current page of orders displayed for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentPage( state = 0, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_ORDERS_SET_PAGE:
			return action.page;
		default:
			return state;
	}
}

const ordersReducer = combineReducers( {
	currentPage
} );

export default keyedReducer( 'siteId', ordersReducer );
