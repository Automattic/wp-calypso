/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getBillingTransactions } from './';

/**
 * Returns all upcoming billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Array}          An array of upcoming transactions
 */
export default function getUpcomingBillingTransactions( state ) {
	return get( getBillingTransactions( state ), 'upcoming', null );
}
