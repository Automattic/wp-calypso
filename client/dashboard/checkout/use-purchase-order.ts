import { fetchPurchaseOrder } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import type { PurchaseOrder } from '@automattic/api-core';

const POLL_INTERVAL_MS = 5000;

function isOrderComplete( order: PurchaseOrder | undefined ): boolean {
	if ( ! order ) {
		return false;
	}
	return order.processing_status !== 'processing' && order.processing_status !== 'async-pending';
}

/**
 * Polls the order status endpoint at a fixed interval until the order reaches
 * a terminal state (success, error, or payment-failure).
 */
export function usePurchaseOrder( orderId: number | undefined ): {
	isLoading: boolean;
	order: PurchaseOrder | undefined;
} {
	const shouldFetch = Boolean( orderId );

	const { data: order, isLoading } = useQuery( {
		queryKey: [ 'purchase-order', orderId ],
		queryFn: () => fetchPurchaseOrder( orderId! ),
		enabled: shouldFetch,
		refetchInterval: ( query ) =>
			isOrderComplete( query.state.data ) ? false : POLL_INTERVAL_MS,
	} );

	return {
		order,
		isLoading: shouldFetch ? isLoading : false,
	};
}
