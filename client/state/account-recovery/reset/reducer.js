/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { get } from 'lodash';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
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

export default combineReducers( {
	options: resetOptions,
} );
