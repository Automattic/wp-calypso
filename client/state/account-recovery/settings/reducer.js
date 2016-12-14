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

const convertEmailResponse = ( emailResponse ) => {
	return emailResponse ? emailResponse : '';
};

const data = createReducer( null, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) => {
		const {
			email,
			email_validated,
			phone,
			phone_validated,
		} = settings;

		// At the moment, the response from /me/account-recovery could have an object or false for the phone field,
		// and an string or false for the email field. I personally don't like the mixed value so did the conversion
		// in the following.
		return {
			...state,
			email: convertEmailResponse( email ),
			emailValidated: email_validated,
			phone: convertPhoneResponse( phone ),
			phoneValidated: phone_validated,
		};
	},

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, value } ) => {
		switch ( target ) {
			case 'phone':
				return {
					...state,
					phone: convertPhoneResponse( value ),
				};
			case 'email':
				return {
					...state,
					email: convertEmailResponse( value ),
				};
			default: // do nothing to unknown targets
				return { ...state };
		}
	},

	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: ( state, { target } ) => {
		switch ( target ) {
			case 'phone':
				return {
					...state,
					phone: null,
				};
			case 'email':
				return {
					...state,
					email: '',
				};
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
