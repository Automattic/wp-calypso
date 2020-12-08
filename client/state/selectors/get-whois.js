/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * Returns domain contact details if we've successfully requested them.
 *
 * @param  {object}  state       Global state tree
 * @param  {string}  domain      Domain to query details
 * @returns {object}              Contact details
 */
export default function getWhois( state, domain ) {
	return get( state, [ 'domains', 'management', 'items', domain ], false );
}
