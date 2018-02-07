/** @format */

/**
 * External dependencies
 */

import { camelCase, each, get } from 'lodash';

/**
 * Returns domain contact details validation messages returned by server, if any
 *
 * @param  {Object}  state   Global state tree
 * @return {Object} validation messages
 */
export default function getDomainContactValidationMessages( state ) {
	const messages = get( state, 'domains.management.contactDetailsValidation', {} );
	// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
	// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
	// converts it to camelCase which is the format stored in the formState.
	each( messages, ( value, key ) => {
		messages[ camelCase( key ) ] = value;
	} );
	return messages;
}
