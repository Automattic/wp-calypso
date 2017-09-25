/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { itemsSchema } from './schema';
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

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
