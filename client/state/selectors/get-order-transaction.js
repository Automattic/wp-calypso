/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/order-transactions/init';

export const getOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'items', orderId ], null );

export default getOrderTransaction;
