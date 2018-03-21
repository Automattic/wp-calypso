/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingBillingTransactions } from 'state/selectors';

/**
 * Returns true if we are currently making a request to bulk fetch past billing
 * transactions or fetching an individual transaction. False otherwise.
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   transactionId ID of the requested transaction
 * @return {Boolean}                Whether a billing transaction is being requested
 */
export default ( state, transactionId ) =>
	isRequestingBillingTransactions( state ) ||
	get(
		state,
		[ 'billingTransactions', 'individualTransactions', transactionId, 'requesting' ],
		false
	);
