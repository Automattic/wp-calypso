/**
 * External Dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_TEAMS_RECEIVE,
} from 'state/action-types';
import { itemsSchema } from './schema';
import { createReducer } from 'state/utils';

export const items = createReducer( [], {
	[ READER_TEAMS_RECEIVE ]: ( state, action ) => action.payload.teams,
}, itemsSchema );

export default combineReducers( {
	items,
} );
