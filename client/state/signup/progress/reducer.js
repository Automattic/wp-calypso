/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_PROGRESS_UPDATE } from 'state/action-types';
import { createReducer } from 'state/utils';
import { schema } from './schema';

export default createReducer(
	[],
	{
		[ SIGNUP_PROGRESS_UPDATE ]: ( state, { data } ) => {
			return Array.isArray( data ) ? data : [];
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return [];
		},
	},
	schema
);
