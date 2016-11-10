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

const createActionInProgressReducer = ( initiateActions, finishActions, actionTargetCheck = () => true ) => {
	const initiateCallback = ( state, action ) => {
		if ( actionTargetCheck( action ) ) {
			return true;
		}

		return state;
	};

	const finishCallback = ( state, action ) => {
		if ( actionTargetCheck( action ) ) {
			return false;
		}

		return state;
	};

	const initiateHandlers = initiateActions.reduce(
		( accumulator, actionType ) => ( { ...accumulator, [ actionType ]: initiateCallback } ),
		{}
	);
	const finishHandlers = finishActions.reduce(
		( accumulator, actionType ) => ( { ...accumulator, [ actionType ]: finishCallback } ),
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

const phoneActionTargetCheck = ( { target } ) => ( 'phone' === target );

const isUpdatingPhone = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ],
	phoneActionTargetCheck
);

const isDeletingPhone = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE ],
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ],
	phoneActionTargetCheck
);

const emailActionTargetCheck = ( { target } ) => ( 'email' === target );

const isUpdatingEmail = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ],
	emailActionTargetCheck
);

const isDeletingEmail = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE ],
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ],
	emailActionTargetCheck
);

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
	isFetching,
	isUpdatingPhone,
	isDeletingPhone,
	isUpdatingEmail,
	isDeletingEmail,
	data,
} );
