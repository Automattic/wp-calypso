/** @format */

/**
 * Internal dependencies
 */
import {
	USERNAME_CLEAR_VALIDATION,
	USERNAME_VALIDATION_FAILURE,
	USERNAME_VALIDATION_SUCCESS,
} from 'state/action-types';

export const DEFAULT_STATE = {
	validation: false,
};

export default function( state = DEFAULT_STATE, action = {} ) {
	switch ( action.type ) {
		case USERNAME_CLEAR_VALIDATION:
			return DEFAULT_STATE;
		case USERNAME_VALIDATION_FAILURE:
			return {
				validation: {
					error: action.error,
					message: action.message,
				},
			};
		case USERNAME_VALIDATION_SUCCESS:
			return {
				validation: {
					success: true,
					allowedActions: action.allowedActions,
					validatedUsername: action.validatedUsername,
				},
			};
		default:
			return state || DEFAULT_STATE;
	}
}
