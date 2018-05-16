/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

import getUsernameValidation from 'state/selectors/get-username-validation';

/**
 * Returns the failure message of user validation
 *
 * @param {Object} state Global state tree
 * @return {String} the failure message of username validation, or `null` if the failure message does not exist
 */

export default function getUsernameValidationFailureMessage( state ) {
	const validation = getUsernameValidation( state );
	return get( validation, 'message', null );
}
