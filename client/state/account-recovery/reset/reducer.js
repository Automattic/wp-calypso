/**
 * External dependencies
 */
import { stubTrue, stubFalse } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducersWithPersistence, createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_SET_METHOD,
	ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

const options = combineReducersWithPersistence( {
	isRequesting: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: stubTrue,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: stubFalse,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: stubFalse,
	} ),

	error: createReducer( null, {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: ( state, { error } ) => error,
	} ),

	items: createReducer( [], {
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: ( state, { items } ) => items,
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => [],
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: () => [],
	} ),
} );

const userData = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ]: ( state, action ) => action.userData,
} );

const method = createReducer( null, {
	[ ACCOUNT_RECOVERY_RESET_SET_METHOD ]: ( state, action ) => action.method,
} );

const requestReset = combineReducersWithPersistence( {
	isRequesting: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_REQUEST ]: stubTrue,
		[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ]: stubFalse,
		[ ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]: stubFalse,
	} ),

	error: createReducer( null, {
		[ ACCOUNT_RECOVERY_RESET_REQUEST ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]: ( state, { error } ) => error,
	} ),
} );

const key = createReducer( null, {
	[ ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY ]: ( state, action ) => action.key,
} );

const validate = combineReducersWithPersistence( {
	isRequesting: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: stubTrue,
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS ]: stubFalse,
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR ]: stubFalse,
	} ),

	error: createReducer( null, {
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR ]: ( state, { error } ) => error,
	} ),
} );

const resetPassword = combineReducersWithPersistence( {
	isRequesting: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: stubTrue,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS ]: stubFalse,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR ]: stubFalse,
	} ),
	succeeded: createReducer( false, {
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: stubFalse,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS ]: stubTrue,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR ]: stubFalse,
	} ),
	error: createReducer( null, {
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS ]: () => null,
		[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR ]: ( state, { error } ) => error,
	} ),
} );

export default combineReducersWithPersistence( {
	options,
	userData,
	method,
	requestReset,
	key,
	validate,
	resetPassword,
} );
