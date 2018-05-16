/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the username validation result
 *
 * @param {Object} state Global state tree
 * @return {*} dictionary with the username validation result, or `false` if the validation result is cleared
 */

export default function getUsernameValidation( state ) {
	return get( state, 'username.validation', false );
}
