import { fetchTransactionOrder } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const transactionOrderQuery = ( orderId: number ) =>
	queryOptions( {
		queryKey: [ 'me', 'transactions', 'order', orderId ],
		queryFn: () => fetchTransactionOrder( orderId ),
		// An order's status only means anything while its payment is in flight.
		meta: { persist: false },
	} );
