/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	WOOCOMMERCE_COUNT_REQUEST,
	WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
	WOOCOMMERCE_COUNT_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

export function isLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_COUNT_REQUEST:
		case WOOCOMMERCE_COUNT_REQUEST_SUCCESS:
		case WOOCOMMERCE_COUNT_REQUEST_FAILURE:
			return WOOCOMMERCE_COUNT_REQUEST === action.type;
		default:
			return state;
	}
}

export function items( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_COUNT_REQUEST_SUCCESS:
			return action.counts;
		default:
			return state;
	}
}

export default combineReducers( {
	isLoading,
	items,
} );
