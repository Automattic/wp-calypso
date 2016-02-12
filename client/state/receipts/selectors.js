import { initialReceiptState } from './reducer';

export function getReceiptById( state, receiptId ) {
	return state.receipts[ receiptId ] || initialReceiptState;
}
