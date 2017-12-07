/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the type of the last profile links request error, or null if there's no error.
 * Can be one of 'duplicate', 'malformed', 'other' or `null`.
 *
 * @param {Object} state Global state tree
 * @return {?String}     Error type.
 */
export default function getProfileLinksErrorType( state ) {
	if ( get( state, [ 'profileLinks', 'errors', 'duplicate' ], false ) ) {
		return 'duplicate';
	}

	if ( get( state, [ 'profileLinks', 'errors', 'malformed' ], false ) ) {
		return 'malformed';
	}

	if ( get( state, [ 'profileLinks', 'errors', 'error' ], false ) ) {
		return 'other';
	}

	return null;
}
