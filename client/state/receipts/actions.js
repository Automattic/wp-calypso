/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { createReceiptObject } from './assembler';
import {
	RECEIPT_FETCH,
	RECEIPT_FETCH_COMPLETED,
	RECEIPT_FETCH_FAILED
} from 'state/action-types';
import wpcom from 'lib/wp';

export function fetchReceipt( receiptId ) {
	return ( dispatch ) => {
		dispatch( {
			type: RECEIPT_FETCH,
			receiptId
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().me().getReceipt( receiptId, ( error, data ) => {
				if ( error ) {
					const errorMessage = error.message || i18n.translate( 'There was a problem retrieving your receipt.' );

					dispatch( {
						type: RECEIPT_FETCH_FAILED,
						receiptId,
						error: errorMessage
					} );

					reject( errorMessage );
				} else {
					dispatch( fetchReceiptCompleted( receiptId, data ) );

					resolve();
				}
			} );
		} );
	};
};

export function fetchReceiptCompleted( receiptId, data ) {
	return {
		type: RECEIPT_FETCH_COMPLETED,
		receiptId,
		receipt: createReceiptObject( data )
	};
}
