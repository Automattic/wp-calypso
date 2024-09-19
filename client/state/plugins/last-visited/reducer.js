import { PLUGINS_SET_LAST_VISITED } from 'calypso/state/action-types';

export function lastVisited( state = { slug: '', listName: '' }, action ) {
	if ( action.type === PLUGINS_SET_LAST_VISITED ) {
		return action.payload;
	}
	return state;
}
