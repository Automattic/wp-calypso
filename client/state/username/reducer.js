/** @format */

/**
 * Internal dependencies
 */
import {
	USERNAME_CLEAR_VALIDATION,
	USERNAME_VALIDATION_FAILURE,
	USERNAME_VALIDATION_SUCCESS,
} from 'state/action-types';
import { USERNAME_DEFAULT } from './constants';

export default function( state, action = {} ) {
	switch ( action.type ) {
		case USERNAME_CLEAR_VALIDATION:
			return USERNAME_DEFAULT;
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
			return state || USERNAME_DEFAULT;
	}
}
