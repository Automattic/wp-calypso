/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'client/state/utils';
import { HELP_COURSES_RECEIVE } from 'client/state/action-types';

export const items = createReducer( null, {
	[ HELP_COURSES_RECEIVE ]: ( state, { courses } ) => courses,
} );

export default combineReducers( {
	items,
} );
