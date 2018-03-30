/** @foramt */

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import { ORDER_TRANSACTION_FETCH, ORDER_TRANSACTION_SET } from 'state/action-types';

export const orderTransactions = keyedReducer(
	'orderId',
	createReducer(
		null,
		{
			[ ORDER_TRANSACTION_FETCH ]: () => null,
			[ ORDER_TRANSACTION_SET ]: ( state, { detail } ) => detail,
		}
	)
);

export default orderTransactions;
