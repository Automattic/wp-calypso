import { combineReducers } from 'redux';

import {
	HAPPYCHAT_OPEN,
} from 'state/action-types';

const open = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_OPEN:
			return action.isOpen !== undefined ? action.isOpen : state;
	}
	return state;
};

export default combineReducers( { open } );
