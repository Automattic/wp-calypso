/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns billing contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @return {Object}              Contact details
 */
export default function getBillingContactDetails( state ) {
	return get( state, 'billingTransactions.contactDetails', null );
}
