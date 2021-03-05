/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import { MEDIA_MODAL_VIEW_SET } from 'calypso/state/action-types';

export const view = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case MEDIA_MODAL_VIEW_SET:
			return action.view;
	}

	return state;
} );

export default combineReducers( {
	view,
} );
