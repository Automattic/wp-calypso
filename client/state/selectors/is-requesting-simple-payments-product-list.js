/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently performing a request to fetch the simple payments product list.
 * False otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}             Whether connection status is currently being requested for that site.
 */
export default function isRequestingSimplePaymentsProductList( state, siteId ) {
	return get( state.simplePayments.productList.requesting, siteId, false );
}
