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
	SERIALIZE,
} from 'state/action-types';

const isRequesting = ( state = false, action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: true,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: false,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: true,
}, action.type, state );

const error = ( state = null, action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: null,
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR ]: action.error,
}, action.type, state );

const options = ( state = {}, action ) => get( {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE ]: action.options,
	[ SERIALIZE ]: {},
}, action.type, state );

const resetOptions = combineReducers( {
	isRequesting,
	error,
	options,
} );

export default combineReducers( {
	options: resetOptions,
} );
