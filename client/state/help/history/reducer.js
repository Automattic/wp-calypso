import { SUPPORT_HISTORY_SET } from 'calypso/state/action-types';

export default function supportHistory( state = [], action ) {
	switch ( action.type ) {
		case SUPPORT_HISTORY_SET:
			return action.items;
		default:
			return state;
	}
}
