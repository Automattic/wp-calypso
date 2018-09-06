/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Return a boolean value indicating whether a request for billing contact details
 * from the server-side DB cache is in progress.
 *
 * @param  {Object} state  Global state tree
 * @return {Boolean} If the request is in progress
 */
export default function isRequestingBillingContactDetails( state ) {
	return get( state, 'billingTransactions.requestingContactDetails', false );
}
