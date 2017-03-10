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
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

const isRequesting = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: ( state, { target } ) => ( {
		...state,
		[ target ]: true,
	} ),
	[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
	[ ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
} );

const errorReducer = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: ( state, { target } ) => ( {
		...state,
		[ target ]: null,
	} ),
	[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ]: ( state, { target } ) => ( {
		...state,
		[ target ]: null,
	} ),
	[ ACCOUNT_RECOVERY_RESET_REQUEST_ERROR ]: ( state, { target, error } ) => ( {
		...state,
		[ target ]: error,
	} ),
} );

const itemsReducer = createReducer( [], {
	[ ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS ]: ( state, { target, items } ) =>
		'resetOptions' === target ? items : state,
} );

const validUserDataProps = [ 'user', 'firstName', 'lastName', 'url' ];

const userData = createReducer( {}, {
	[ ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA ]: ( state, action ) => ( {
		...state,
		...pick( action.userData, validUserDataProps ),
	} ),
} );

export default combineReducers( {
	items: itemsReducer,
	userData,
	isRequesting,
	error: errorReducer,
} );
