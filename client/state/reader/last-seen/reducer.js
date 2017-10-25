/**
 * Internal Dependencies
 */
import { READER_LAST_SEEN_UPDATE } from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';
import schema from './schema';

/**
 * Module code
 */

export const lastSeenToken = ( state = null, action ) => {
	if ( ( state && state.token ) !== action.payload ) {
		return {
			token: action.payload,
			updated: new Date().toISOString(),
		};
	}
	return state;
};

export const tokenCollection = createReducer(
	{},
	{
		[ READER_LAST_SEEN_UPDATE ]: keyedReducer( 'streamId', lastSeenToken ),
	},
	schema
);
