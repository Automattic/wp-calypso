/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'state/utils';
import { CONCIERGE_SIGNUP_FORM_UPDATE, CONCIERGE_UPDATE_BOOKING_STATUS } from 'state/action-types';
import guessTimezone from 'lib/i18n-utils/guess-timezone';

export const message = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.message;
	}

	return state;
} );

export const timezone = withoutPersistence( ( state = guessTimezone() || 'UTC', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.timezone;
	}

	return state;
} );

export const isRebrandCitiesSite = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.isRebrandCitiesSite;
	}

	return state;
} );

export const firstname = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.firstname;
	}

	return state;
} );

export const lastname = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.lastname;
	}

	return state;
} );

export const phoneNumber = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.phoneNumber;
	}

	return state;
} );

export const countryCode = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.countryCode;
	}

	return state;
} );

export const phoneNumberWithoutCountryCode = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.phoneNumberWithoutCountryCode;
	}

	return state;
} );

export const status = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_UPDATE_BOOKING_STATUS:
			return action.status;
	}

	return state;
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
