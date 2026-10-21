import { transactionOrderQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useDebugValue } from 'react';
import {
	ERROR,
	PROCESSING,
	ASYNC_PENDING,
	FAILURE,
	SUCCESS,
	UNKNOWN,
} from '../types/order-transaction';
import type { OrderTransaction } from '../types/order-transaction';
import type { TransactionOrder, TransactionOrderStatus } from '@automattic/api-core';

type OrderTransactionStatus =
	| typeof ERROR
	| typeof PROCESSING
	| typeof ASYNC_PENDING
	| typeof FAILURE
	| typeof SUCCESS
	| typeof UNKNOWN;

function transformPurchaseOrderStatusToOrderTransactionStatus(
	rawStatus: TransactionOrderStatus
): OrderTransactionStatus {
	switch ( rawStatus ) {
		case 'error':
			return ERROR;
		case 'processing':
			return PROCESSING;
		case 'async-pending':
			return ASYNC_PENDING;
		case 'payment-confirmed':
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
 * and replace it with TransactionOrder everywhere, but for now this will reduce the
 * refactoring needs as we migrate to this hook.
 */
function transformRawOrderToOrderTransaction( rawOrder: TransactionOrder ): OrderTransaction {
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

function isOrderComplete( order: undefined | TransactionOrder ): boolean {
	if ( ! order ) {
		return false;
	}
	const status = transformPurchaseOrderStatusToOrderTransactionStatus( order.processing_status );
	return status !== PROCESSING && status !== ASYNC_PENDING;
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

	const { data: order, isLoading } = useQuery( {
		...transactionOrderQuery( orderId ?? 0 ),
		enabled: shouldFetch,
		select: transformRawOrderToOrderTransaction,
		refetchInterval: ( query ) => ( isOrderComplete( query.state.data ) ? false : pollInterval ),
	} );

	const output = { isLoading: shouldFetch ? isLoading : false, order };
	useDebugValue( output );
	return output;
}
