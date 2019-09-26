/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getBillingTransactions from 'state/selectors/get-billing-transactions';

/**
 * Returns all past billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Array}          An array of past transactions
 */
export default function getPastBillingTransactions( state ) {
	return get( getBillingTransactions( state ), 'past', null );
}
