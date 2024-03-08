import { useQuery } from '@tanstack/react-query';
import { useDebugValue } from 'react';
import wp from 'calypso/lib/wp';
import {
	ERROR,
	PROCESSING,
	ASYNC_PENDING,
	FAILURE,
	SUCCESS,
	UNKNOWN,
} from 'calypso/state/order-transactions/constants';
import type { OrderTransaction } from 'calypso/state/selectors/get-order-transaction';

export async function fetchPurchaseOrder(
	orderId: number | undefined
): Promise< RawOrder | undefined > {
	if ( ! orderId ) {
		return undefined;
	}
	return wp.req.get( `/me/transactions/order/${ orderId }`, {
		apiVersion: '1.1',
	} );
}

export type PurchaseOrderStatus =
	| 'error'
	| 'processing'
	| 'async-pending'
	| 'payment-failure'
	| 'success';
type OrderTransactionStatus =
	| typeof ERROR
	| typeof PROCESSING
	| typeof ASYNC_PENDING
	| typeof FAILURE
	| typeof SUCCESS
	| typeof UNKNOWN;

export interface RawOrder {
	order_id: number;
	user_id: number;
	receipt_id: number | undefined;
	processing_status: PurchaseOrderStatus;
}

function transformPurchaseOrderStatusToOrderTransactionStatus(
	rawStatus: PurchaseOrderStatus
): OrderTransactionStatus {
	switch ( rawStatus ) {
		case 'error':
			return ERROR;
		case 'processing':
			return PROCESSING;
		case 'async-pending':
			return ASYNC_PENDING;
		case 'payment-failure':
			return FAILURE;
		case 'success':
			return SUCCESS;
		default:
			return UNKNOWN;
	}
}

/**
 * Convert data from the endpoint into the data format previously used by the
 * order data-layer.
 *
 * TODO: in the future it would be nice to get rid of OrderTransaction entirely
 * and replace it with RawOrder everywhere, but for now this will reduce the
 * refactoring needs as we migrate to this hook.
 */
function transformRawOrderToOrderTransaction( rawOrder: RawOrder ): OrderTransaction {
	const processingStatus = transformPurchaseOrderStatusToOrderTransactionStatus(
		rawOrder.processing_status
	);
	if ( processingStatus === SUCCESS && rawOrder.receipt_id ) {
		return {
			orderId: rawOrder.order_id,
			userId: rawOrder.user_id,
			receiptId: rawOrder.receipt_id,
			processingStatus,
		};
	}
	if ( processingStatus === ERROR ) {
		return {
			orderId: rawOrder.order_id,
			userId: rawOrder.user_id,
			processingStatus,
		};
	}
	if ( processingStatus === PROCESSING ) {
		return {
			orderId: rawOrder.order_id,
			userId: rawOrder.user_id,
			processingStatus,
		};
	}
	if ( processingStatus === ASYNC_PENDING ) {
		return {
			orderId: rawOrder.order_id,
			userId: rawOrder.user_id,
			processingStatus,
		};
	}
	if ( processingStatus === FAILURE ) {
		return {
			orderId: rawOrder.order_id,
			userId: rawOrder.user_id,
			processingStatus,
		};
	}
	return {
		orderId: rawOrder.order_id,
		userId: rawOrder.user_id,
		processingStatus: UNKNOWN,
	};
}

function isOrderComplete( order: undefined | OrderTransaction ): boolean {
	if ( ! order ) {
		return false;
	}
	if ( order.processingStatus === PROCESSING ) {
		return false;
	}
	return true;
}

/**
 * Fetch the current status of an in-progress order.
 */
export default function usePurchaseOrder(
	orderId: number | undefined,
	pollInterval: number
): {
	isLoading: boolean;
	order: OrderTransaction | undefined;
} {
	const shouldFetch = Boolean( orderId );
	const queryKey = [ 'purchase-order', orderId ];

	const { data: order, isLoading } = useQuery< OrderTransaction | undefined, Error >( {
		queryKey,
		queryFn: async () => {
			const rawOrder = await fetchPurchaseOrder( orderId );
			return rawOrder ? transformRawOrderToOrderTransaction( rawOrder ) : undefined;
		},
		enabled: shouldFetch,
		refetchInterval: ( query ) => ( isOrderComplete( query.state.data ) ? false : pollInterval ),
	} );

	const output = { isLoading: shouldFetch ? isLoading : false, order };
	useDebugValue( output );
	return output;
}
