import { fetchReceipt, fetchUserReceipts, sendBillingReceiptEmail } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const userReceiptsQuery = () =>
	queryOptions( {
		queryKey: [ 'billing-transactions', 'past' ],
		queryFn: () => fetchUserReceipts(),
	} );

export const receiptQueryKey = ( receiptId: number, includeFailedPurchases = false ) => [
	'receipt',
	receiptId,
	includeFailedPurchases,
];

export const receiptQuery = ( receiptId: number, includeFailedPurchases = false ) =>
	queryOptions( {
		queryKey: receiptQueryKey( receiptId, includeFailedPurchases ),
		queryFn: () => fetchReceipt( receiptId, includeFailedPurchases ),
	} );

export const sendReceiptEmailMutation = () =>
	mutationOptions( {
		mutationFn: ( receiptId: string ) => sendBillingReceiptEmail( receiptId ),
	} );
