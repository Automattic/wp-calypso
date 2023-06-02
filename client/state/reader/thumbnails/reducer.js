import { READER_THUMBNAIL_RECEIVE } from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Tracks mappings between embedUrls (iframe.src) --> thumbnails
 * Here is what the state tree may look like:
 *
 *   thumbnails: {
 *     items: {
 *       'https://www.youtube.com/watch?v=syWk7P3SPMQ': https://img.youtube.com/vi/syWk7P3SPMQ/mqdefault.jpg,
 *       ...
 *     },
 *     requesting: {
 *       'https://www.youtube.com/watch?v=syWk7P3SPMQ': false,
 *       ...
 *     }
 *   }
 *
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @returns {Array}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_THUMBNAIL_RECEIVE:
			return {
				...state,
				[ action.embedUrl ]: action.thumbnailUrl,
			};
	}

	return state;
}

export default combineReducers( {
	items,
} );
