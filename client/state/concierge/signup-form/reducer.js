import { guessTimezone } from '@automattic/i18n-utils';
import {
	CONCIERGE_SIGNUP_FORM_UPDATE,
	CONCIERGE_UPDATE_BOOKING_STATUS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const message = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.message;
	}

	return state;
};

export const timezone = ( state = guessTimezone() || 'UTC', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.timezone;
	}

	return state;
};

export const firstname = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.firstname;
	}

	return state;
};

export const lastname = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.lastname;
	}

	return state;
};

export const phoneNumber = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.phoneNumber;
	}

	return state;
};

export const countryCode = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.countryCode;
	}

	return state;
};

export const phoneNumberWithoutCountryCode = ( state = '', action ) => {
	switch ( action.type ) {
		case CONCIERGE_SIGNUP_FORM_UPDATE:
			return action.signupForm.phoneNumberWithoutCountryCode;
	}

	return state;
};

export const status = ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_UPDATE_BOOKING_STATUS:
			return action.status;
	}

	return state;
};

export default combineReducers( {
	firstname,
	lastname,
	message,
	timezone,
	status,
	phoneNumber,
	countryCode,
	phoneNumberWithoutCountryCode,
} );
