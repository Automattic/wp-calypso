export const SUCCESS = 'ORDER_TRANSACTION_STATUS_SUCCESS';
export const PROCESSING = 'ORDER_TRANSACTION_STATUS_PROCESSING';
export const FAILURE = 'ORDER_TRANSACTION_STATUS_FAILURE';
export const ERROR = 'ORDER_TRANSACTION_STATUS_ERROR';
export const UNKNOWN = 'ORDER_TRANSACTION_STATUS_UNKNOWN';
export const ASYNC_PENDING = 'ORDER_TRANSACTION_STATUS_ASYNC_PENDING';

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
