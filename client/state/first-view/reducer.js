/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE
} from 'state/action-types';

export function firstView( state, action ) {
	switch ( action.type ) {
		case FIRST_VIEW_HIDE:
			return state;
	}
	return state;
}

export default firstView;
