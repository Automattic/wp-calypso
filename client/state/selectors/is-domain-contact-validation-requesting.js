/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns domain contact details validation messages returned by server, if any
 *
 * @param  {Object}  state   Global state tree
 * @return {Object} validation messages
 */
export default function isDomainContactValidationRequesting( state ) {
	return get( state, 'domains.management.isRequestingContactDetailsValidation', false );
}
