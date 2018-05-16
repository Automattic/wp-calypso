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
 * Returns the validated username
 *
 * @param {Object} state Global state tree
 * @return {String} the validated username, or `null` if the validated username does not exist
 */

export default function getValidatedUsername( state ) {
	const validation = getUsernameValidation( state );
	return get( validation, 'validatedUsername', null );
}
