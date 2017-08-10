/** @format */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of query (page number) to a
 * boolean reflecting whether a request for that page is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTES_REQUEST:
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS:
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.orderId ]: WOOCOMMERCE_ORDER_NOTES_REQUEST === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Returns the updated order saving state after an action has been
 * dispatched. This reflects a mapping of order ID to a boolean,
 * indicating whether there is a save in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isSaving( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTE_CREATE:
		case WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE:
		case WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS:
			return Object.assign( {}, state, {
				[ action.orderId ]: WOOCOMMERCE_ORDER_NOTE_CREATE === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Tracks all known order objects, indexed by post ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	let notes;
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS:
			notes = keyBy( action.notes, 'id' );
			return Object.assign( {}, state, notes );
		default:
			return state;
	}
}

/**
 * Tracks which notes belong to an order, as a list of IDs
 * referencing items in `notes.items`.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function orders( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS:
			const idList = action.notes.map( note => note.id );
			return Object.assign( {}, state, { [ action.orderId ]: idList } );
		default:
			return state;
	}
}

export default combineReducers( {
	isLoading,
	isSaving,
	items,
	orders,
} );
