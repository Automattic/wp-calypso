/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'client/state/action-types';
import { combineReducers, createReducer } from 'client/state/utils';
import { itemsSchema } from './schema';

export const items = createReducer(
	[],
	{
		[ READER_TEAMS_RECEIVE ]: ( state, action ) => {
			if ( action.error ) {
				return state;
			}
			return get( action, [ 'payload', 'teams' ], state );
		},
	},
	itemsSchema
);

export const isRequesting = createReducer( false, {
	[ READER_TEAMS_REQUEST ]: () => true,
	[ READER_TEAMS_RECEIVE ]: () => false,
} );

export default combineReducers( {
	items,
	isRequesting,
} );
