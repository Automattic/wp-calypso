import 'calypso/state/order-transactions/init';

export const getOrderTransactionError = ( state, orderId ) =>
	state?.orderTransactions?.error?.[ orderId ] ?? null;

export default getOrderTransactionError;
