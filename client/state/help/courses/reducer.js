/**
 * Internal dependencies
 */
import { HELP_COURSES_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer( null, {
	[ HELP_COURSES_RECEIVE ]: ( state, { courses } ) => courses
} );

export default combineReducers( {
	items
} );
