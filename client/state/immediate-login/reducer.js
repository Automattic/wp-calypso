/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { IMMEDIATE_LOGIN_SAVE_STATUS } from 'state/action-types';

const initialState = {
	used: false,
	reason: null,
};

export default createReducer( initialState, {
	[ IMMEDIATE_LOGIN_SAVE_STATUS ]: ( state, { reason } ) => ( {
		used: true,
		reason: reason || null,
	} ),
} );
