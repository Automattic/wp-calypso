/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of order ID to a
 * boolean indicating whether there is a save in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isSaving( state = null, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_REFUND_CREATE:
		case WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS:
		case WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE:
			return WOOCOMMERCE_ORDER_REFUND_CREATE === action.type;
		default:
			return state;
	}
}

export function items( state = [], action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS:
			return action.refunds;
		case WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS:
			return [ ...state, action.refund ];
		default:
			return state;
	}
}

export default keyedReducer(
	'orderId',
	combineReducers( {
		isSaving,
		items,
	} )
);
