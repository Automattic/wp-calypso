/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns cached domain contact details if we've successfully requested them.
 *
 * @param  {object}  state       Global state tree
 * @returns {object}              Contact details
 */
export default function getContactDetailsCache( state ) {
	return get( state, 'domains.management.items._contactDetailsCache', null );
}
