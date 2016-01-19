/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the current user ID
 * has been set.
 *
 * @param  {Number} userId User ID
 * @return {Object}        Action object
 */
export function setCurrentUserId( userId ) {
	return {
		type: CURRENT_USER_ID_SET,
		userId
	};
}
