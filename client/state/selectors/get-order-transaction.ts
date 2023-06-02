import { get } from 'lodash';
import {
	SUCCESS,
	PROCESSING,
	FAILURE,
	ERROR,
	UNKNOWN,
	ASYNC_PENDING,
} from 'calypso/state/order-transactions/constants';
import type { AppState } from 'calypso/types';

import 'calypso/state/order-transactions/init';

interface OrderTransactionBase {
	orderId: number;
	userId: number;
}
export interface OrderTransactionSuccess extends OrderTransactionBase {
	processingStatus: typeof SUCCESS;
	receiptId: number;
}
export interface OrderTransactionProcessing extends OrderTransactionBase {
	processingStatus: typeof PROCESSING;
}
export interface OrderTransactionFailure extends OrderTransactionBase {
	processingStatus: typeof FAILURE;
}
export interface OrderTransactionError extends OrderTransactionBase {
	processingStatus: typeof ERROR;
}
export interface OrderTransactionUnknown extends OrderTransactionBase {
	processingStatus: typeof UNKNOWN;
}
export interface OrderTransactionAsyncPending extends OrderTransactionBase {
	processingStatus: typeof ASYNC_PENDING;
}
export type OrderTransaction =
	| OrderTransactionSuccess
	| OrderTransactionProcessing
	| OrderTransactionFailure
	| OrderTransactionError
	| OrderTransactionUnknown
	| OrderTransactionAsyncPending;

export const getOrderTransaction = ( state: AppState, orderId: number ): OrderTransaction | null =>
	get( state, [ 'orderTransactions', 'items', orderId ], null );

export default getOrderTransaction;
