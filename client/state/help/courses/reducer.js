/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'state/utils';
import { HELP_COURSES_RECEIVE } from 'state/action-types';

export const items = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case HELP_COURSES_RECEIVE: {
			const { courses } = action;
			return courses;
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
