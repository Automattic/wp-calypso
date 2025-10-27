import { fetchReceipt, fetchUserReceipts, sendBillingReceiptEmail } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const userReceiptsQuery = () =>
	queryOptions( {
		queryKey: [ 'billing-transactions', 'past' ],
		queryFn: () => fetchUserReceipts(),
	} );

export const receiptQueryKey = ( receiptId: number ) => [ 'receipt', receiptId ];

export const receiptQuery = ( receiptId: number ) =>
	queryOptions( {
		queryKey: receiptQueryKey( receiptId ),
		queryFn: () => fetchReceipt( receiptId ),
	} );

export const sendReceiptEmailMutation = () =>
	mutationOptions( {
		mutationFn: ( receiptId: string ) => sendBillingReceiptEmail( receiptId ),
	} );
