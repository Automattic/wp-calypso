import i18n from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	RECEIPT_FETCH,
	RECEIPT_FETCH_COMPLETED,
	RECEIPT_FETCH_FAILED,
} from 'calypso/state/action-types';
import { createReceiptObject } from './assembler';

import 'calypso/state/receipts/init';

export function fetchReceipt( receiptId ) {
	return ( dispatch ) => {
		dispatch( {
			type: RECEIPT_FETCH,
			receiptId,
		} );

		return wpcom.req
			.get( `/me/billing-history/receipt/${ receiptId }` )
			.then( ( data ) => {
				dispatch( fetchReceiptCompleted( receiptId, data ) );
			} )
			.catch( ( error ) => {
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

export function fetchReceiptCompleted( receiptId, data ) {
	return {
		type: RECEIPT_FETCH_COMPLETED,
		receiptId,
		receipt: createReceiptObject( data ),
	};
}
