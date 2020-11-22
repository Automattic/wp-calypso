/**
 * Internal dependencies
 */
import {
	RECEIPT_FETCH,
	RECEIPT_FETCH_COMPLETED,
	RECEIPT_FETCH_FAILED,
} from 'calypso/state/action-types';
import { initialReceiptState } from 'calypso/state/receipts/initial';
import { combineReducers, withStorageKey } from 'calypso/state/utils';

/**
 * Returns a new state with the given attributes for the given receipt ID.
 *
 * @param {object} state current state
 * @param {number} receiptId identifier of the site
 * @param {object} attributes list of attributes and their values
 * @returns {object} the new state
 */
function updateReceiptState( state, receiptId, attributes ) {
	return Object.assign( {}, state, {
		[ receiptId ]: Object.assign( {}, initialReceiptState, state[ receiptId ], attributes ),
	} );
}

export function items( state = {}, action ) {
	switch ( action.type ) {
		case RECEIPT_FETCH:
			return updateReceiptState( state, action.receiptId, {
				isRequesting: true,
			} );
		case RECEIPT_FETCH_COMPLETED:
			return updateReceiptState( state, action.receiptId, {
				data: action.receipt,
				error: null,
				hasLoadedFromServer: true,
				isRequesting: false,
			} );
		case RECEIPT_FETCH_FAILED:
			return updateReceiptState( state, action.receiptId, {
				error: action.error,
				isRequesting: false,
			} );
	}

	return state;
}

const combinedReducer = combineReducers( {
	items,
} );

export default withStorageKey( 'receipts', combinedReducer );
