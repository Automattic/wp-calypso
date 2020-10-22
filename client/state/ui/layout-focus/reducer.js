/**
 * Internal dependencies
 */

import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
	LAYOUT_NEXT_FOCUS_SET,
} from 'calypso/state/action-types';

const initialState = { current: 'content', next: null };

export default function layoutFocus( state = initialState, action ) {
	switch ( action.type ) {
		case LAYOUT_FOCUS_SET:
			if ( action.area === state.current ) {
				return state;
			}
			return Object.assign( {}, state, { current: action.area } );
		case LAYOUT_NEXT_FOCUS_SET:
			if ( action.area === state.next ) {
				return state;
			}
			return Object.assign( {}, state, { next: action.area } );
		case LAYOUT_NEXT_FOCUS_ACTIVATE:
			// If we don't have a change queued, set it to `content`. This avoids
			// having to set the focus to content on all navigation links because it
			// becomes the default after focus has shifted.
			let next = state.next;
			if ( ! next && state.current !== 'content' ) {
				next = 'content';
			}
			if ( ! next ) {
				return state;
			}
			return Object.assign( {}, state, { current: next, next: null } );
	}
	return state;
}
