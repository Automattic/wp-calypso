/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/billing-transactions/init';

/**
 * Returns filter for the billing transactions of the given type
 *
 * @param  {object}  state           Global state tree
 * @param  {string}  transactionType Transaction type
 * @returns {object}                 Billing transaction filters
 */
export default ( state, transactionType ) => {
	const filters = get( state, [ 'billingTransactions', 'ui', transactionType ], {} );
	return {
		app: '',
		date: { month: null, operator: null },
		page: 1,
		query: '',
		...filters,
	};
};
