/**
 * External Dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_RECEIVE,
} from 'state/action-types';
import { createReducer } from 'state/utils';

// TODO add in error handling
export const items = createReducer( [], {
	[ READER_TEAMS_RECEIVE ]: ( state, action ) => action.payload.teams,
} );

// TODO were we carrying any errors + doing anything with them before?
export const isRequesting = createReducer( false, {
	[ READER_TEAMS_REQUEST ]: () => true,
	[ READER_TEAMS_RECEIVE ]: () => false,
} );

export default combineReducers( {
	items,
	isRequesting,
} );
