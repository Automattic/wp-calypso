/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
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

function isUpdating( state = {}, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE:
			return { ...state, [ action.target ]: true };
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return { ...state, [ action.target ]: false };
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED:
			return { ...state, [ action.target ]: false };
		default:
			return state;
	}
}

function isDeleting( state = {}, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_DELETE:
			return { ...state, [ action.target ]: true };
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return { ...state, [ action.target ]: false };
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED:
			return { ...state, [ action.target ]: false };
		default:
			return state;
	}
}

function hasSentValidation( state = {}, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION:
			return { ...state, [ action.target ]: true };
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return { ...state, [ action.target ]: true };
		default:
			return state;
	}
}

function convertPhoneResponse( phoneResponse ) {
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
}

function phone( state = null, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return convertPhoneResponse( action.settings.phone );
		// There is no calling of convertPhoneResponse here, because the endpoint for updating
		// recovery settings doesn't return the updated value in the response body. Thus,
		// the `value` encapsulated here is actually passed down from the action creator and
		// in the exactly the same form, hence no need of converting.
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return 'phone' === action.target ? action.value : state;
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return 'phone' === action.target ? null : state;
		default:
			return state;
	}
}

function email( state = '', action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return action.settings.email;
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return 'email' === action.target ? action.value : state;
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return 'email' === action.target ? '' : state;
		default:
			return state;
	}
}

function phoneValidated( state = false, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return action.settings.phone_validated;
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return 'phone' === action.target ? false : state;
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return 'phone' === action.target ? false : state;
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS:
			return true;
		default:
			return state;
	}
}

function isValidatingPhone( state = false, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE:
			return true;
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS:
			return false;
		case ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED:
			return false;
		default:
			return state;
	}
}

function emailValidated( state = false, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return action.settings.email_validated;
		case ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS:
			return 'email' === action.target ? false : state;
		case ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS:
			return 'email' === action.target ? false : state;
		default:
			return state;
	}
}

function isReady( state = false, action ) {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS:
			return true;
		default:
			return state;
	}
}

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
