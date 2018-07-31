/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { SAVE_IMMEDIATE_LOGIN_INFORMATION } from './constants';

const initialState = {
	used: false,
	reason: null,
};

export default createReducer( initialState, {
	[ SAVE_IMMEDIATE_LOGIN_INFORMATION ]: ( state, { reason } ) => ( {
		reason,
		used: true,
	} ),
} );
