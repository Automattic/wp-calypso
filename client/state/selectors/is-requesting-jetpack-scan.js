/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/data-layer/wpcom/sites/scan';

/**
 * Returns true if we are currently making a request to retrieve Jetpack Scan status. False otherwise.
 * Returns false if the site is unknown, or there is no information yet.
 *
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the connection data is being requested
 */
export default function isRequestingJetpackScan( state, siteId ) {
	return get( state.jetpackScan.requestStatus, [ siteId ], false ) === 'pending';
}
