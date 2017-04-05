/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { pick } from 'lodash';

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

const createRequestingReducer = ( onActions, offActions ) => createReducer( false, {
	...onActions.reduce( ( accumulator, action ) => {
		accumulator[ action ] = () => true;
		return accumulator;
	}, {} ),
	...offActions.reduce( ( accumulator, action ) => {
		accumulator[ action ] = () => false;
		return accumulator;
	}, {} ),
} );

const createErrorReducer = ( cleanActions, errorActions ) => createReducer( null, {
	...cleanActions.reduce( ( accumulator, action ) => {
		accumulator[ action ] = () => null;
		return accumulator;
	}, {} ),
	...errorActions.reduce( ( accumulator, action ) => {
		accumulator[ action ] = ( state, { error } ) => error;
		return accumulator;
	}, {} ),
} );

const options = combineReducers( {
	isRequesting: createRequestingReducer(
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ],
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE, ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ],
	),

	error: createErrorReducer(
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST, ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ],
		[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]
	),

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
	isRequesting: createRequestingReducer(
		[ ACCOUNT_RECOVERY_RESET_REQUEST ],
		[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS, ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]
	),

	error: createErrorReducer(
		[ ACCOUNT_RECOVERY_RESET_REQUEST, ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ],
		[ ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]
	),
} );

const key = createReducer( null, {
	[ ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY ]: ( state, action ) => action.key,
} );

const validate = combineReducers( {
	isRequesting: createRequestingReducer(
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ],
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS, ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR ]
	),

	error: createErrorReducer(
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST, ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS ],
		[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR ]
	),
} );

export default combineReducers( {
	options,
	userData,
	method,
	requestReset,
	key,
	validate,
} );
