import 'calypso/state/order-transactions/init';

export const getOrderTransactionError = ( state, orderId ) =>
	state?.orderTransactions?.errors?.[ orderId ] ?? null;

export default getOrderTransactionError;
