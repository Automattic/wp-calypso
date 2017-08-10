/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns domain contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  domain      Domain to query details
 * @return {Object}              Contact details
 */
export default function getWhois( state, domain ) {
	return get( state, [ 'domains', 'management', 'items', domain ], false );
}
