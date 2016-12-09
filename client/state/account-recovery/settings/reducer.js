/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,

	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,

	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
} from 'state/action-types';

const isUpdating = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ]: ( state, { target } ) => ( {
		...state,
		[ target ]: true,
	} ),
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
} );

const isDeleting = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE ]: ( state, { target } ) => ( {
		...state,
		[ target ]: true,
	} ),
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]: ( state, { target } ) => ( {
		...state,
		[ target ]: false,
	} ),
} );

const data = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated
	} ),

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, value } ) => {
		switch ( target ) {
			case 'phone':
				return { ...state, phone: value };
			case 'email':
				return { ...state, email: value };
			default: // do nothing to unknown targets
				return { ...state };
		}
	},

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) => {
		switch ( target ) {
			case 'phone':
				return { ...state, phone: {} };
			case 'email':
				return { ...state, email: '' };
			default: // do nothing to unknown targets
				return { ...state };
		}
	},
} );

export default combineReducers( {
	data,
	isUpdating,
	isDeleting,
} );
