import 'calypso/state/receipts/init';

import { initialReceiptState } from 'calypso/state/receipts/initial';
import { AppState } from 'calypso/types';
import { ReceiptState } from './types';

export function getReceiptById(
	state: AppState,
	receiptId: number | string | undefined
): ReceiptState {
	if ( ! receiptId ) {
		return initialReceiptState;
	}
	return state.receipts.items[ receiptId ] || initialReceiptState;
}
