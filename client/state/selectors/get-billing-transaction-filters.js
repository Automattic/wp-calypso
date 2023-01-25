import { get } from 'lodash';

import 'calypso/state/billing-transactions/init';

/**
 * Returns filter for the billing transactions of the given type
 *
 * @param  {Object}  state           Global state tree
 * @param  {string}  transactionType Transaction type
 * @returns {Object}                 Billing transaction filters
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
