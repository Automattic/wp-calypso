import { get } from 'lodash';

import 'calypso/state/order-transactions/init';

export const isFetchingOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'isFetching', orderId ], false );

export default isFetchingOrderTransaction;
