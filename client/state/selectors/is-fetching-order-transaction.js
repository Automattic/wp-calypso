/**
 * External dependencies
 */
import { get } from 'lodash';

export const isFetchingOrderTransaction = ( state, orderId ) =>
	get( state, [ 'orderTransactions', 'isFetching', orderId ], false );

export default isFetchingOrderTransaction;
