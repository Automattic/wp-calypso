/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a boolean value indicating whether requesting for the password reset options is in progress.
 *
 * @param  {Object} state  Global state tree
 * @return {Boolean} If the request is in progress
 */
export function isRequestingWhois( state, domain ) {
	return get( state, [ 'domains.management.requesting', domain ], false );
};
