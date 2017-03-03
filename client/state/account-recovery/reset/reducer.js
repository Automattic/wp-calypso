/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get, pick } from 'lodash';

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

const isRequesting = ( state = false, action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: true,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: false,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: false,
}, action.type, state );

const error = ( state = null, action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: null,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: null,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: action.error,
}, action.type, state );

const items = ( state = [], action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: action.items,
}, action.type, state );

const resetOptions = combineReducers( {
	isRequesting,
	error,
	items,
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
