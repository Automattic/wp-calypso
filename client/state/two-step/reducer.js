/** @format */

/**
 * Internal dependencies
 */
import {
	TWO_STEP_SET,
	TWO_STEP_VALIDATE_CODE_REQUEST,
	TWO_STEP_SET_CODE_VALIDATION_RESULT,
	TWO_STEP_SEND_SMS_CODE_REQUEST,
	TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
} from 'state/action-types';
import { combineReducers } from 'state/utils';

export const settings = ( state = {}, action ) => {
	if ( action.type === TWO_STEP_SET ) {
		return action.data;
	}

	if ( action.type === TWO_STEP_SET_CODE_VALIDATION_RESULT ) {
		return Object.assign( {}, state, {
			twoStepReauthorizationRequired: ! action.data.success,
		} );
	}

	return state;
};

export const SMSValidationCodeResult = ( state = null, action ) => {
	if ( action.type === TWO_STEP_SEND_SMS_CODE_REQUEST ) {
		return null;
	}

	if ( action.type === TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT ) {
		return action.data;
	}

	return state;
};

//TODO: implemenation
export const appAuthCodes = ( state = {}, action ) => {
	return state;
};

export const isCodeValidationInProgress = ( state = false, action ) => {
	if ( action.type === TWO_STEP_VALIDATE_CODE_REQUEST ) {
		return true;
	}

	if ( action.type === TWO_STEP_SET_CODE_VALIDATION_RESULT ) {
		return false;
	}

	return state;
};

export const codeValidationResult = ( state = null, action ) => {
	if ( action.type === TWO_STEP_VALIDATE_CODE_REQUEST ) {
		return null;
	}

	if ( action.type === TWO_STEP_SET_CODE_VALIDATION_RESULT ) {
		return action.data.success;
	}

	return state;
};

export default combineReducers( {
	settings,
	SMSValidationCodeResult,
	appAuthCodes,
	isCodeValidationInProgress,
	codeValidationResult,
} );
