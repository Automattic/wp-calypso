import { MEDIA_MODAL_VIEW_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const view = ( state = null, action ) => {
	switch ( action.type ) {
		case MEDIA_MODAL_VIEW_SET:
			return action.view;
	}

	return state;
};

export default combineReducers( {
	view,
} );
