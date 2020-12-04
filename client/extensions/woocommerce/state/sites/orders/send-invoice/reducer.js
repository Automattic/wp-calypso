/**
 * External dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import {
	WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
	WOOCOMMERCE_ORDER_INVOICE_SEND,
	WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Tracks the status of "sending" an order invoice API request
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isSending( state = {}, action ) {
	const { type, orderId } = action;
	switch ( type ) {
		case WOOCOMMERCE_ORDER_INVOICE_SEND:
			return { ...state, [ orderId ]: true };
		case WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS:
		case WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE:
			return { ...state, [ orderId ]: false };
		default:
			return state;
	}
}

export default combineReducers( {
	isSending,
} );
