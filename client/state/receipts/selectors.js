import { initialReceiptState } from 'calypso/state/receipts/initial';

import 'calypso/state/receipts/init';

/**
 * @param {import('calypso/types').AppState} state
 * @param {number|string|undefined} receiptId
 * @returns {import('./types').ReceiptState}
 */
export function getReceiptById( state, receiptId ) {
	return state.receipts.items[ receiptId ] || initialReceiptState;
}
