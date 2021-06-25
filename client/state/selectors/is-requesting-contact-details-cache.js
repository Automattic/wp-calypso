/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * Return a boolean value indicating whether a request for domain contact details
 * from the server-side DB cache is in progress.
 *
 * @param  {object} state  Global state tree
 * @returns {boolean} If the request is in progress
 */
export default function isRequestingContactDetailsCache( state ) {
	return get( state, 'domains.management.isRequestingContactDetails', false );
}
