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

const convertPhoneProperties = ( rawPhone ) => {
	const {
		country_code,
		country_numeric_code,
		number,
		number_full,
	} = rawPhone;

	return {
		phoneCountryCode: country_code,
		phoneCountryNumericCode: country_numeric_code,
		phoneNumber: number,
		phoneNumberFull: number_full,
	};
};

const data = createReducer( null, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { settings } ) => {
		const {
			email,
			email_validated,
			phone,
			phone_validated,
		} = settings;

		return {
			...state,
			email,
			emailValidated: email_validated,
			...convertPhoneProperties( phone ),
			phoneValidated: phone_validated
		};
	},

	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: ( state, { target, value } ) => {
		switch ( target ) {
			case 'phone':
				return {
					...state,
					...convertPhoneProperties( value ),
				};
			case 'email':
				return {
					...state,
					email: value,
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
					phoneCountryCode: '',
					phoneCountryNumericCode: '',
					phoneNumber: '',
					phoneNumberFull: '',
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
