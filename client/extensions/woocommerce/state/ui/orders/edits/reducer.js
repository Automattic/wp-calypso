/**
 * External dependencies
 */
import { merge, omit, uniqueId } from 'lodash';
import { combineReducers } from 'calypso/state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT,
	WOOCOMMERCE_UI_ORDERS_EDIT,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects the currently edited order ID (which might
 * be a placeholder object).
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function currentlyEditingId( state = null, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_ORDERS_EDIT:
			if ( action.order && action.order.id ) {
				return action.order.id;
			}
			return { placeholder: uniqueId( 'order_' ) };
		case WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT:
			return null;
		case WOOCOMMERCE_ORDER_UPDATE_SUCCESS:
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function changes( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_ORDERS_EDIT:
			const order = omit( action.order, 'id' );
			return merge( {}, state, order );
		case WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT:
			return {};
		case WOOCOMMERCE_ORDER_UPDATE_SUCCESS:
			return {};
		default:
			return state;
	}
}

export default combineReducers( {
	changes,
	currentlyEditingId,
} );
