/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', orderId ], null );

export default getOrderTransaction;
