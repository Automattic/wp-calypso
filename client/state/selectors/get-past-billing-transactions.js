/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getBillingTransactions } from './';

/**
 * Returns all past billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Array}          An array of past transactions
 */
const getPastBillingTransactions = createSelector(
	( state ) => {
		return get( getBillingTransactions( state ), [ 'past' ], null );
	},
	getBillingTransactions
);

export default getPastBillingTransactions;
