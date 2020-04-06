/**
 * Internal dependencies
 */

import { DROPZONE_SHOW, DROPZONE_HIDE } from 'state/action-types';

import { combineReducers, withoutPersistence } from 'state/utils';

// TODO(biskobe) - Can be improved with `keyedReducer` instead of state spread.
const isVisible = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case DROPZONE_SHOW: {
			const { dropZoneName } = action;

			return {
				...state,
				[ dropZoneName ]: true,
			};
		}
		case DROPZONE_HIDE: {
			const { dropZoneName } = action;

			return {
				...state,
				[ dropZoneName ]: false,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	isVisible,
} );
