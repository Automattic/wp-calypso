/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of order ID to a
 * boolean indicating whether there is a save in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isSaving( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_REFUND_CREATE:
		case WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS:
		case WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE:
			return Object.assign( {}, state, {
				[ action.orderId ]: WOOCOMMERCE_ORDER_REFUND_CREATE === action.type,
			} );
		default:
			return state;
	}
}

export default combineReducers( {
	isSaving,
} );
