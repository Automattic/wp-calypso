/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';

import 'calypso/state/billing-transactions/init';

/**
 * Returns true if we are currently making a request to bulk fetch past billing
 * transactions or fetching an individual transaction. False otherwise.
 *
 * @param  {object}   state         Global state tree
 * @param  {number}   transactionId ID of the requested transaction
 * @returns {boolean}                Whether a billing transaction is being requested
 */
export default ( state, transactionId ) =>
	isRequestingBillingTransactions( state ) ||
	get(
		state,
		[ 'billingTransactions', 'individualTransactions', transactionId, 'requesting' ],
		false
	);
