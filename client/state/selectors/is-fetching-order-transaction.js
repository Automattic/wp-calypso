/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/order-transactions/init';

export const isFetchingOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'isFetching', orderId ], false );

export default isFetchingOrderTransaction;
