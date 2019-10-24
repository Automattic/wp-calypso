/** @format */

/**
 * Internal dependencies
 */
import { SITES_DISABLE_PREVIEW } from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITES_DISABLE_PREVIEW: {
			return {
				...state,
				[ action.payload.siteId ]: { disabled: true },
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
