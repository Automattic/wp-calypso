/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	HELP_COURSES_RECEIVE,
	HELP_COURSES_REQUEST,
	HELP_COURSES_REQUEST_FAILURE,
	SERIALIZE,
} from 'state/action-types';

export const requesting = createReducer( false, {
	[ HELP_COURSES_REQUEST ]: () => true,
	[ HELP_COURSES_RECEIVE ]: () => false,
	[ HELP_COURSES_REQUEST_FAILURE ]: () => false,
	[ SERIALIZE ]: () => false,
} );

export const items = createReducer( null, {
	[ HELP_COURSES_RECEIVE ]: ( state, { courses } ) => courses
} );

export default combineReducers( {
	requesting,
	items,
} );
