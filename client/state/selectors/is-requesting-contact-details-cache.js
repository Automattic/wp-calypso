/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Return a boolean value indicating whether a request for domain contact details
 * from the server-side DB cache is in progress.
 *
 * @param  {Object} state  Global state tree
 * @return {Boolean} If the request is in progress
 */
export default function isRequestingContactDetailsCache( state ) {
	return get( state, 'domains.management.isRequestingContactDetails', false );
}
