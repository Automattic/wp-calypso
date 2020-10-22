/**
 * External dependencies
 */
import { includes, without } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_RESET, EDITOR_SAVE_BLOCK, EDITOR_SAVE_UNBLOCK } from 'calypso/state/action-types';

export default ( state = [], action ) => {
	switch ( action.type ) {
		case EDITOR_SAVE_BLOCK:
			return includes( state, action.key ) ? state : [ ...state, action.key ];
		case EDITOR_SAVE_UNBLOCK:
			return includes( state, action.key ) ? without( state, action.key ) : state;
		case EDITOR_RESET:
			return state.length > 0 ? [] : state;
	}

	return state;
};
