/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getBillingTransactions from 'state/selectors/get-billing-transactions';

/**
 * Returns all upcoming billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {object}  state   Global state tree
 * @returns {?Array}          An array of upcoming transactions
 */
export default function getUpcomingBillingTransactions( state ) {
	return get( getBillingTransactions( state ), 'upcoming', null );
}
