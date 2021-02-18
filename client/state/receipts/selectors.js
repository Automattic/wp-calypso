/**
 * Internal dependencies
 */
import { initialReceiptState } from 'calypso/state/receipts/initial';

import 'calypso/state/receipts/init';

export function getReceiptById( state, receiptId ) {
	return state.receipts.items[ receiptId ] || initialReceiptState;
}
