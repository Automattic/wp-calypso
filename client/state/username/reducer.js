/** @format */

/**
 * Internal dependencies
 */
import { USERNAME_VALIDATION_FAILURE } from 'state/action-types';

export const DEFAULT_STATE = {
	validation: false,
};

export default function( state = DEFAULT_STATE, action = {} ) {
	switch ( action.type ) {
		case USERNAME_VALIDATION_FAILURE:
			return {
				validation: {
					error: action.error,
					message: action.message,
				},
			};
		default:
			return state || DEFAULT_STATE;
	}
}
