/**
 * External dependencies
 */

import { includes, concat, compact, reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SITES_BLOG_STICKER_LIST_RECEIVE,
	SITES_BLOG_STICKER_ADD,
	SITES_BLOG_STICKER_REMOVE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITES_BLOG_STICKER_LIST_RECEIVE: {
			return {
				...state,
				[ action.payload.blogId ]: action.payload.stickers,
			};
		}
		case SITES_BLOG_STICKER_ADD: {
			const { blogId, stickerName } = action.payload;

			// If the blog already has this sticker, do nothing
			if ( includes( state[ blogId ], stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: compact( concat( stickerName, state[ blogId ] ) ),
			};
		}
		case SITES_BLOG_STICKER_REMOVE: {
			const { blogId, stickerName } = action.payload;

			// If the blog doesn't have this sticker, do nothing
			if ( ! includes( state[ blogId ], stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: reject( state[ blogId ], ( sticker ) => sticker === stickerName ),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
