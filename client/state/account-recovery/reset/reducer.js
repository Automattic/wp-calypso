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
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

const isRequesting = createReducer( false, {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => true,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: () => false,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: () => false,
} );

const errorReducer = createReducer( null, {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: () => null,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: () => null,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: ( state, { error } ) => error,
} );

const itemsReducer = createReducer( [], {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: ( state, { items } ) => items,
} );

const resetOptions = combineReducers( {
	isRequesting,
	error: errorReducer,
	items: itemsReducer,
} );

const validUserDataProps = [ 'user', 'firstName', 'lastName', 'url' ];

const userData = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ]: ( state, action ) => ( {
		...state,
		...pick( action.userData, validUserDataProps ),
	} ),
} );

export default combineReducers( {
	options: resetOptions,
	userData,
} );
