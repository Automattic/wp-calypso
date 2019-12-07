/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { IMMEDIATE_LOGIN_SAVE_INFO } from 'state/action-types';

const initialState = {
	attempt: false,
	success: false,
	reason: null,
	email: null,
	locale: null,
};

export default createReducer( initialState, {
	[ IMMEDIATE_LOGIN_SAVE_INFO ]: ( state, { success, reason, email, locale } ) => ( {
		attempt: true,
		success: !! success,
		reason: reason || null,
		email: email || null,
		locale: locale || null,
	} ),
} );
