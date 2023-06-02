import { get } from 'lodash';

import 'calypso/state/order-transactions/init';

export const getOrderTransactionError = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'errors', orderId ], null );

export default getOrderTransactionError;
