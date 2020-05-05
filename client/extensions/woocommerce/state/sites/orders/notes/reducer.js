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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS:
			const notes = keyBy( action.notes, 'id' );
			return Object.assign( {}, state, notes );
		case WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS:
			const note = action.note;
			return Object.assign( {}, state, { [ note.id ]: note } );
		default:
			return state;
	}
}

/**
 * Tracks which notes belong to an order, as a list of IDs
 * referencing items in `notes.items`.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function orders( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS: {
			const idList = action.notes.map( ( note ) => note.id );
			return Object.assign( {}, state, { [ action.orderId ]: idList } );
		}
		case WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS: {
			const { note, orderId } = action;
			const idList = [ ...state[ orderId ], note.id ];
			return Object.assign( {}, state, { [ orderId ]: idList } );
		}
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
