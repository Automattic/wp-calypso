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

const data = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated
	} ),
} );

export default combineReducers( {
	isFetching,
	data,
} );
