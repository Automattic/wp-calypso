/** @format */

/**
 * Internal dependencies
 */
import {
	TWO_STEP_REQUEST,
	TWO_STEP_SET,
	TWO_STEP_VALIDATE_CODE_REQUEST,
	TWO_STEP_SEND_SMS_CODE_REQUEST,
	TWO_STEP_APP_AUTH_CODES_REQUEST,
} from 'state/action-types';

/**
 * Returns an action object to signal the request of the user's two step configuration.
 * @returns {Object} Action object
 */
export const requestTwoStep = () => ( { type: TWO_STEP_REQUEST } );

export const setTwoStep = data => ( { type: TWO_STEP_SET, data } );

export const validateCode = ( code, action ) => ( {
	type: TWO_STEP_VALIDATE_CODE_REQUEST,
	code,
	action,
} );

export const sendSMSValidationCode = () => ( { type: TWO_STEP_SEND_SMS_CODE_REQUEST } );

export const getAppAuthCodes = () => ( { type: TWO_STEP_APP_AUTH_CODES_REQUEST } );
