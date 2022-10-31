import { initialReceiptState } from 'calypso/state/receipts/initial';
import type { ReceiptState } from './types';
import type { AppState } from 'calypso/types';

import 'calypso/state/receipts/init';

export function getReceiptById(
	state: AppState,
	receiptId: number | string | undefined
): ReceiptState {
	if ( ! receiptId ) {
		return initialReceiptState;
	}
	return state.receipts.items[ receiptId ] || initialReceiptState;
}
