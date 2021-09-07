import { get } from 'lodash';

import 'calypso/state/order-transactions/init';

export const getOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'items', orderId ], null );

export default getOrderTransaction;
