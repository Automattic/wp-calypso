/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns filter for the billing transactions of the given type
 *
 * @param  {object}  state           Global state tree
 * @param  {String}  transactionType Transaction type
 * @return {object}                 Billing transaction filters
 */
export default ( state, transactionType ) => {
	const filters = get( state, [ 'ui', 'billingTransactions', transactionType ], {} );
	return {
		app: '',
		date: { month: null, operator: null },
		page: 1,
		query: '',
		...filters,
	};
};
