/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import { HELP_COURSES_RECEIVE } from 'calypso/state/action-types';

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
