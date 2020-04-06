/**
 * External dependencies
 */
import { get } from 'lodash';

export const getOrderTransactionError = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'errors', orderId ], null );

export default getOrderTransactionError;
