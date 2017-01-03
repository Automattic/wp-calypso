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

const convertPhoneResponse = ( phoneResponse ) => {
	if ( ! phoneResponse ) {
		return null;
	}

	const {
		country_code,
		country_numeric_code,
		number,
		number_full,
	} = phoneResponse;

	return {
		countryCode: country_code,
		countryNumericCode: country_numeric_code,
		number: number,
		numberFull: number_full,
	};
};

const phone = createReducer( null, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) =>
		convertPhoneResponse( settings.phone ),

	// There is no calling of convertPhoneResponse here, because the endpoint for updating
	// recovery settings doesn't return the updated value in the response body. Thus,
	// the `value` encapsulated here is actually passed down from the action creator and
	// in the exactly the same form, hence no need of converting.
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, value } ) =>
		'phone' === target ? value : state,

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) =>
		'phone' === target ? null : state,
} );

const email = createReducer( '', {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) =>
		settings.email,

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, value } ) =>
		'email' === target ? value : state,

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) =>
		'email' === target ? '' : state,
} );

const phoneValidated = createReducer( false, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) =>
		settings.phone_validated,

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target } ) =>
		'phone' === target ? false : state,

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) =>
		'phone' === target ? false : state,
} );

const emailValidated = createReducer( false, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) =>
		settings.email_validated,

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target } ) =>
		'email' === target ? false : state,

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) =>
		'email' === target ? false : state,
} );

const isReady = createReducer( false, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: () => true,
} );

export default combineReducers( {
	data: combineReducers( {
		phone,
		phoneValidated,
		email,
		emailValidated,
	} ),
	isUpdating,
	isDeleting,
	isReady,
} );
