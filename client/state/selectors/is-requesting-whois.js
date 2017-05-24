/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a boolean value indicating whether requesting WHOIS details is in progress.
 *
 * @param  {Object} state	Global state tree
 * @param  {String} domain	the domain in question
 * @return {Boolean} If the request is in progress
 */
export function isRequestingWhois( state, domain ) {
	return get( state, [ 'domains.management.requesting', domain ], false );
}
