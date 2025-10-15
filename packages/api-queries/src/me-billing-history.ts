import { fetchReceipt } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const receiptQueryKey = ( receiptId: number ) => [ 'receipt', receiptId ];

export const receiptQuery = ( receiptId: number ) =>
	queryOptions( {
		queryKey: receiptQueryKey( receiptId ),
		queryFn: () => fetchReceipt( receiptId ),
	} );
