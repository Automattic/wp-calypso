/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import { HELP_COURSES_RECEIVE } from 'state/action-types';

export const items = ( state = null, action ) => {
	switch ( action.type ) {
		case HELP_COURSES_RECEIVE: {
			const { courses } = action;
			return courses;
		}
	}

	return state;
};

export default combineReducers( {
	items,
} );
