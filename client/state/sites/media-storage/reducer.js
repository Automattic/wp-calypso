import { SITE_MEDIA_STORAGE_RECEIVE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Tracks media-storage information, indexed by site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_MEDIA_STORAGE_RECEIVE: {
			const { max_storage_bytes, storage_used_bytes } = action.mediaStorage;
			return { ...state, [ action.siteId ]: { max_storage_bytes, storage_used_bytes } };
		}
	}
	return state;
} );

export default combineReducers( { items } );
