import { INVITES_RECEIVE } from 'state/action-types';
import { combineReducers } from 'state/utils';

export const items = ( state = [], action ) => {
	switch( action.type ) {
		case INVITES_RECEIVE:
			return action.invites.invites;
	}

	return state;
}

export default combineReducers( {
	items,
} );
