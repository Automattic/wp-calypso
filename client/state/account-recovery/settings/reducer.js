/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,

	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,

	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
} from 'state/action-types';

const createActionInProgressReducer = ( initiateActions, finishActions ) => {
	const trueFunc = () => true;
	const falseFunc = () => false;

	const initiateHandlers = initiateActions.reduce(
		( accumulator, actionType ) => ( { ...accumulator, [ actionType ]: trueFunc } ),
		{}
	);
	const finishHandlers = finishActions.reduce(
		( accumulator, actionType ) => ( { ...accumulator, [ actionType ]: falseFunc } ),
		{}
	);

	return createReducer( false, {
		...initiateHandlers,
		...finishHandlers,
	} );
};

const isFetching = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH ],
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]
);

const isUpdatingPhone = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]
);

const isDeletingPhone = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE ],
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]
);

const isUpdatingEmail = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]
);

const data = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated
	} ),

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, data } ) => {
		switch ( target ) {
			case 'phone':
				return { ...state, phone: data };
			case 'email':
				return { ...state, email: data };
			default: // do nothing to unknown targets
				return { ...state };
		}
	},

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) => {
		switch ( target ) {
			case 'phone':
				return { ...state, phone: {} };
			default: // do nothing to unknown targets
				return { ...state };
		}
	},
} );

export default combineReducers( {
	isFetching,
	isUpdatingPhone,
	isDeletingPhone,
	isUpdatingEmail,
	data,
} );
