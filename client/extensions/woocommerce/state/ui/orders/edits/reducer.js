/**
 * External dependencies
 */
import { uniqueId } from 'lodash';
import { combineReducers } from 'state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_UI_ORDERS_CLEAR,
	WOOCOMMERCE_UI_ORDERS_EDIT,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects the currently edited order ID (which might
 * be a placeholder object).
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentlyEditingId( state = null, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_ORDERS_EDIT:
			if ( action.order && action.order.id ) {
				return action.order.id;
			}
			return { placeholder: uniqueId( 'order_' ) };
		case WOOCOMMERCE_UI_ORDERS_CLEAR:
			return null;
		default:
			return state;
	}
}

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects changes made to the current order (including
 * newly created orders)
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function changes( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_ORDERS_EDIT:
			return { ...state, ...action.order };
		case WOOCOMMERCE_UI_ORDERS_CLEAR:
			return {};
		default:
			return state;
	}
}

export default combineReducers( {
	changes,
	currentlyEditingId,
} );
