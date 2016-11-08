/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import reset from './reset/reducer';
import settings from './settings/reducer';

import { createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,

	ACCOUNT_RECOVERY_PHONE_UPDATE,
	ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,
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
	[ ACCOUNT_RECOVERY_FETCH ],
	[ ACCOUNT_RECOVERY_FETCH_SUCCESS, ACCOUNT_RECOVERY_FETCH_FAILED ]
);

const isUpdatingPhone = createActionInProgressReducer(
	[ ACCOUNT_RECOVERY_PHONE_UPDATE ],
	[ ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS, ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED ]
);

const data = createReducer( {}, {
	[ ACCOUNT_RECOVERY_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated
	} ),

	[ ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS ]: ( state, { phone } ) => ( {
		...state,
		phone,
	} ),
} );

export default combineReducers( {
	settings,
	reset,
} );
