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
 * Returns if username is valid
 *
 * @param {Object} state Global state tree
 * @return {?Object} `true` if username is valid, `false` otherwise.
 */

export default function isUsernameValid( state ) {
	const validation = getUsernameValidation( state );
	return get( validation, 'success', false );
}
