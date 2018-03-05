/** @format */

/**
 * Internal dependencies
 */
import { TWO_STEP_SET } from 'state/action-types';
import { combineReducers } from 'state/utils';

export const settings = ( state = {}, action ) => {
	if ( action.type === TWO_STEP_SET ) {
		return action.data;
	}

	return state;
};

export const invalidCode = ( state = false, action ) => {
	return state;
};

export const smsResendThrottled = ( state = false, action ) => {
	return state;
};

export const appAuthCodes = ( state = {}, action ) => {
	return state;
};

export default combineReducers( {
	settings,
	invalidCode,
	smsResendThrottled,
	appAuthCodes,
} );
