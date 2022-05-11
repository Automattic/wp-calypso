import {
	SITES_BLOG_STICKER_LIST_RECEIVE,
	SITES_BLOG_STICKER_ADD,
	SITES_BLOG_STICKER_REMOVE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const items = ( state = {}, action ) => {
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
			if ( state[ blogId ] && Object.values( state[ blogId ] ).includes( stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: [ stickerName, ...( state[ blogId ] ?? [] ) ].filter( Boolean ),
			};
		}
		case SITES_BLOG_STICKER_REMOVE: {
			const { blogId, stickerName } = action.payload;

			// If the blog doesn't have this sticker, do nothing
			if ( ! state[ blogId ] || ! Object.values( state[ blogId ] ).includes( stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: state[ blogId ].filter( ( sticker ) => sticker !== stickerName ),
			};
		}
	}

	return state;
};

export default combineReducers( {
	items,
} );
