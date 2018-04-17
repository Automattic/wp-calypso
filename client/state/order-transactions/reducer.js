/** @foramt */

/**
 * Internal dependencies
 */
import {
	createReducer,
	combineReducers,
	keyedReducer,
} from 'state/utils';

import {
	ORDER_TRANSACTION_FETCH,
	ORDER_TRANSACTION_FETCH_ERROR,
	ORDER_TRANSACTION_SET,
} from 'state/action-types';

export const items = keyedReducer(
	'orderId',
	createReducer(
		null,
		{
			[ ORDER_TRANSACTION_FETCH ]: () => null,
			[ ORDER_TRANSACTION_FETCH_ERROR ]: () => null,
			[ ORDER_TRANSACTION_SET ]: ( state, { transaction } ) => transaction,
		}
	)
);

export const isFetching = keyedReducer(
	'orderId',
	createReducer(
		false,
		{
			[ ORDER_TRANSACTION_FETCH ]: () => true,
			[ ORDER_TRANSACTION_FETCH_ERROR ]: () => false,
			[ ORDER_TRANSACTION_SET ]: () => false,
		}
	)
);

export const errors = keyedReducer(
	'orderId',
	createReducer(
		null,
		{
			[ ORDER_TRANSACTION_FETCH ]: () => null,
			[ ORDER_TRANSACTION_FETCH_ERROR ]: ( state, action ) => action.error,
			[ ORDER_TRANSACTION_SET ]: () => null,
		}
	)
);

export default combineReducers( {
	items,
	isFetching,
	errors,
} );
