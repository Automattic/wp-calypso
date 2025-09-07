import { fetchReceipt, sendBillingReceiptEmail } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

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

export const billingTransactionsQuery = () =>
	queryOptions( {
		queryKey: [ 'billing-transactions', 'past' ] as const,
		queryFn: async (): Promise< BillingTransaction[] > => {
			const response = await wp.req.get( '/me/billing-history/past?limit=600', {
				apiVersion: '1.3',
			} );
			return response.billing_history || [];
		},
	} );
