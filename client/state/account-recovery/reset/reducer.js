/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { pick, stubTrue, stubFalse } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_PICK_METHOD,
	ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
} from 'state/action-types';

const options = combineReducers( {
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

const validUserDataProps = [ 'user', 'firstName', 'lastName', 'url' ];

const userData = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ]: ( state, action ) => ( {
		...state,
		...pick( action.userData, validUserDataProps ),
	} ),
} );

const method = createReducer( null, {
	[ ACCOUNT_RECOVERY_RESET_PICK_METHOD ]: ( state, action ) => action.method,
} );

const requestReset = combineReducers( {
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

const validate = combineReducers( {
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

export default combineReducers( {
	options,
	userData,
	method,
	requestReset,
	key,
	validate,
} );
