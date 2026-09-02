import 'calypso/state/order-transactions/init';

export const isFetchingOrderTransaction = ( state, orderId ) =>
	state?.orderTransactions?.isFetching?.[ orderId ] ?? false;

export default isFetchingOrderTransaction;
