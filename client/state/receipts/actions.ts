import i18n from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	RECEIPT_FETCH,
	RECEIPT_FETCH_COMPLETED,
	RECEIPT_FETCH_FAILED,
} from 'calypso/state/action-types';
import { createReceiptObject } from './assembler';
import type { RawReceiptData } from './types';
import type { CalypsoDispatch } from '../types';
import type { WPCOMTransactionEndpointResponseSuccess } from '@automattic/wpcom-checkout';

import 'calypso/state/receipts/init';

export function fetchReceipt( receiptId: number ) {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: RECEIPT_FETCH,
			receiptId,
		} );

		return wpcom.req
			.get( `/me/billing-history/receipt/${ receiptId }` )
			.then( ( data: RawReceiptData ) => {
				dispatch( fetchReceiptCompleted( receiptId, data ) );
			} )
			.catch( ( error: Error ) => {
				const errorMessage =
					error.message || i18n.translate( 'There was a problem retrieving your receipt.' );

				dispatch( {
					type: RECEIPT_FETCH_FAILED,
					receiptId,
					error: errorMessage,
				} );
			} );
	};
}

export function fetchReceiptCompleted(
	receiptId: number,
	data: WPCOMTransactionEndpointResponseSuccess | RawReceiptData
) {
	return {
		type: RECEIPT_FETCH_COMPLETED,
		receiptId,
		receipt: createReceiptObject( data ),
	};
}
