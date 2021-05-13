/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/profile-links/init';

/**
 * Returns the type of the last profile links request error, or null if there's no error.
 * Can be one of 'duplicate', 'malformed', 'other' or `null`.
 *
 * @param {object} state Global state tree
 * @returns {?string}     Error type.
 */
export default function getProfileLinksErrorType( state ) {
	if ( get( state, [ 'userProfileLinks', 'errors', 'duplicate' ], false ) ) {
		return 'duplicate';
	}

	if ( get( state, [ 'userProfileLinks', 'errors', 'malformed' ], false ) ) {
		return 'malformed';
	}

	if ( get( state, [ 'userProfileLinks', 'errors', 'error' ], false ) ) {
		return 'other';
	}

	return null;
}
