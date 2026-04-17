import { fetchReceipt, fetchUserReceipts, sendBillingReceiptEmail } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const userReceiptsQuery = () =>
	queryOptions( {
		queryKey: [ 'billing-transactions', 'past' ],
		queryFn: () => fetchUserReceipts(),
	} );

export const receiptQueryKey = (
	receiptId: number,
	options?: { includeFailedPurchases?: boolean }
) => [ 'receipt', receiptId, options?.includeFailedPurchases ?? false ];

export const receiptQuery = ( receiptId: number, options?: { includeFailedPurchases?: boolean } ) =>
	queryOptions( {
		queryKey: receiptQueryKey( receiptId, options ),
		queryFn: () => fetchReceipt( receiptId, options ),
	} );

export const sendReceiptEmailMutation = () =>
	mutationOptions( {
		mutationFn: ( receiptId: string ) => sendBillingReceiptEmail( receiptId ),
	} );
