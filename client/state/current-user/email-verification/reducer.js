/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';

import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
	EMAIL_VERIFY_STATE_RESET,
} from 'state/action-types';

export const status = createReducer( null, {
	[ EMAIL_VERIFY_REQUEST ]: () => 'requesting',
	[ EMAIL_VERIFY_REQUEST_SUCCESS ]: () => 'sent',
	[ EMAIL_VERIFY_REQUEST_FAILURE ]: () => 'error',
	[ EMAIL_VERIFY_STATE_RESET ]: () => null,
} );

export const errorMessage = createReducer( '', {
	[ EMAIL_VERIFY_REQUEST ]: () => '',
	[ EMAIL_VERIFY_REQUEST_SUCCESS ]: () => '',
	[ EMAIL_VERIFY_REQUEST_FAILURE ]: ( state, { message } ) => message,
	[ EMAIL_VERIFY_STATE_RESET ]: () => '',
} );

export default combineReducers( {
	status,
	errorMessage,
} );
