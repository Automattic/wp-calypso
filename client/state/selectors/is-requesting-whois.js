/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Return a boolean value indicating whether requesting WHOIS details is in progress.
 *
 * @param  {object} state	Global state tree
 * @param  {string} domain	the domain in question
 * @return {boolean} If the request is in progress
 */
export default function isRequestingWhois( state, domain ) {
	return get( state, [ 'domains', 'management', 'isRequestingWhois', domain ], false );
}
