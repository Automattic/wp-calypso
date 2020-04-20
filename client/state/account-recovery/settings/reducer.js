/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'state/utils';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
} from 'state/action-types';

const setTargetState = ( value ) => ( state, { target } ) => ( {
	...state,
	[ target ]: value,
} );

const isUpdating = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE:
			return setTargetState( true )( state, action );
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return setTargetState( false )( state, action );
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED:
			return setTargetState( false )( state, action );
	}

	return state;
} );

const isDeleting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_DELETE:
			return setTargetState( true )( state, action );
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return setTargetState( false )( state, action );
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED:
			return setTargetState( false )( state, action );
	}

	return state;
} );

const hasSentValidation = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION:
			return setTargetState( true )( state, action );
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return setTargetState( true )( state, action );
	}

	return state;
} );

const convertPhoneResponse = ( phoneResponse ) => {
	if ( ! phoneResponse ) {
		return null;
	}

	const { country_code, country_numeric_code, number, number_full } = phoneResponse;

	return {
		countryCode: country_code,
		countryNumericCode: country_numeric_code,
		number: number,
		numberFull: number_full,
	};
};

const phone = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS: {
			const { settings } = action;
			return convertPhoneResponse( settings.phone );
		}
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS: {
			const { target, value } = action;
			return 'phone' === target ? value : state;
		}
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS: {
			const { target } = action;
			return 'phone' === target ? null : state;
		}
	}

	return state;
} );

const email = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS: {
			const { settings } = action;
			return settings.email;
		}
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS: {
			const { target, value } = action;
			return 'email' === target ? value : state;
		}
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS: {
			const { target } = action;
			return 'email' === target ? '' : state;
		}
	}

	return state;
} );

const phoneValidated = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS: {
			const { settings } = action;
			return settings.phone_validated;
		}
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS: {
			const { target } = action;
			return 'phone' === target ? false : state;
		}
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS: {
			const { target } = action;
			return 'phone' === target ? false : state;
		}
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS:
			return true;
	}

	return state;
} );

const isValidatingPhone = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE:
			return true;
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS:
			return false;
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED:
			return false;
	}

	return state;
} );

const emailValidated = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS: {
			const { settings } = action;
			return settings.email_validated;
		}
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS: {
			const { target } = action;
			return 'email' === target ? false : state;
		}
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS: {
			const { target } = action;
			return 'email' === target ? false : state;
		}
	}

	return state;
} );

const isReady = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return true;
	}

	return state;
} );

export default combineReducers( {
	data: combineReducers( {
		phone,
		phoneValidated,
		email,
		emailValidated,
	} ),
	isReady,
	isUpdating,
	isDeleting,
	isValidatingPhone,
	hasSentValidation,
} );
