/** @foramt */

/**
 * Internal dependencies
 */
import { SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH, SOURCE_PAYMENT_TRANSACTION_DETAIL_SET } from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';

export const detailReducer = keyedReducer(
	'orderId',
	createReducer(
		null,
		{
			[ SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH ]: () => null,
			[ SOURCE_PAYMENT_TRANSACTION_DETAIL_SET ]: ( state, { detail } ) => detail,
		}
	)
);

export default detailReducer;
