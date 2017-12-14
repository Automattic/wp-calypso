/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { CONCIERGE_SIGNUP_FORM_UPDATE } from 'state/action-types';

export const message = createReducer( null, {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.message,
} );

export const timezone = createReducer( null, {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.timezone,
} );

export default combineReducers( {
	message,
	timezone,
} );
