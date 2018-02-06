/** @format */

/**
 * External dependencies
 */
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { CONCIERGE_SIGNUP_FORM_UPDATE, CONCIERGE_UPDATE_BOOKING_STATUS } from 'state/action-types';

export const message = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.message,
} );

export const timezone = createReducer( moment.tz.guess(), {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.timezone,
} );

export const firstName = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.firstName,
} );

export const lastName = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.lastName,
} );

export const status = createReducer( null, {
	[ CONCIERGE_UPDATE_BOOKING_STATUS ]: ( state, action ) => action.status,
} );

export default combineReducers( {
	message,
	timezone,
	status,
} );
