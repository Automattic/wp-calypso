/**
 * Internal dependencies
 */
import {
	RECEIPT_FETCH_COMPLETED
} from 'state/action-types';

const initialReceiptState = {
	data: null,
	error: null,
	hasLoadedFromServer: false,
	isRequesting: false
};

/**
 * Returns a new state with the given attributes for the given receipt ID.
 *
 * @param {Object} state current state
 * @param {Number} receiptId identifier of the site
 * @param {Object} attributes list of attributes and their values
 * @returns {Object} the new state
 */
function updateReceiptState( state, receiptId, attributes ) {
	return Object.assign( {}, state, {
		[ receiptId ]: Object.assign( {}, initialReceiptState, state[ receiptId ], attributes )
	} );
}

export function receipts( state = {}, action ) {
	switch ( action.type ) {
		case RECEIPT_FETCH_COMPLETED:
			return updateReceiptState( state, action.receiptId, {
				data: action.receipt,
				error: null,
				hasLoadedFromServer: true,
				isRequesting: false
			} );
	}

	return state;
}
