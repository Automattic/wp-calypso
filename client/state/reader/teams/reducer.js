/**
 * External Dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_REQUEST_FAILURE,
	READER_TEAMS_REQUEST_SUCCESS,
} from 'state/action-types';
import { createReducer } from 'state/utils';

const items = createReducer( [], {
	READER_TEAMS_REQUEST_SUCCESS: ( state, action ) => [ ...state, action.teams ],
} );

const isRequesting = createReducer( false, {
	[ READER_TEAMS_REQUEST ]: () => true,
	[ READER_TEAMS_REQUEST_FAILURE ]: () => false,
	[ READER_TEAMS_REQUEST_SUCCESS ]: () => false,
} );

export default combineReducers(
	items,
	isRequesting,
);
