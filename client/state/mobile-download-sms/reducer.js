/** @format */

/**
 * Internal dependencies
 */
import {
	GET_APPS_SMS_REQUEST,
	GET_APPS_SMS_REQUEST_FAILURE,
	GET_APPS_SMS_REQUEST_SUCCESS,
} from 'state/action-types';
import { createReducer } from 'state/utils';

const initialState = {
	isPerformingRequest: false,
	status: null,
	error: null,
};

export default createReducer( initialState, {
	[ GET_APPS_SMS_REQUEST ]: state => ( {
		...state,
		isPerformingRequest: true,
		status: null,
		error: null,
	} ),
	[ GET_APPS_SMS_REQUEST_SUCCESS ]: state => ( {
		...state,
		isPerformingRequest: false,
		status: 'success',
		error: null,
	} ),
	[ GET_APPS_SMS_REQUEST_FAILURE ]: ( state, { message } ) => ( {
		...state,
		isPerformingRequest: false,
		status: 'error',
		error: message,
	} ),
} );
