/**
 * External dependencies
 */
import { get } from 'lodash';

export const getOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'items', orderId ], null );

export default getOrderTransaction;
