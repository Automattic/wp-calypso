/**
 * External dependencies
 */
import { get, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { parseTransactionDate } from 'state/billing-transactions/util';

/**
 * Returns all billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Object}         Billing transactions
 */
const getBillingTransactions = createSelector(
	( state ) => {
		const allTransactions = get( state, 'billingTransactions.items', null );
		if ( ! allTransactions ) {
			return null;
		}

		return mapValues( allTransactions, transactions => transactions.map( parseTransactionDate ) );
	},
	( state ) => [ state.billingTransactions.items ]
);

export default getBillingTransactions;
