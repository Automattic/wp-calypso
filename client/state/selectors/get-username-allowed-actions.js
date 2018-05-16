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
 * Returns the user's allowed actions
 *
 * @param {Object} state Global state tree
 * @return {Object} dictionary with the user's allowed actions
 */

export default function getUsernameAllowedActions( state ) {
	const validation = getUsernameValidation( state );
	return get( validation, 'allowedActions', {} );
}
