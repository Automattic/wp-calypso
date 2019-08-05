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

export const isRebrandCitiesSite = createReducer( false, {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.isRebrandCitiesSite,
} );

export const firstname = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.firstname,
} );

export const lastname = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.lastname,
} );

export const phoneNumber = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.phoneNumber,
} );

export const countryCode = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) => action.signupForm.countryCode,
} );

export const phoneNumberWithoutCountryCode = createReducer( '', {
	[ CONCIERGE_SIGNUP_FORM_UPDATE ]: ( state, action ) =>
		action.signupForm.phoneNumberWithoutCountryCode,
} );

export const status = createReducer( null, {
	[ CONCIERGE_UPDATE_BOOKING_STATUS ]: ( state, action ) => action.status,
} );

export default combineReducers( {
	firstname,
	lastname,
	message,
	timezone,
	status,
	isRebrandCitiesSite,
	phoneNumber,
	countryCode,
	phoneNumberWithoutCountryCode,
} );
