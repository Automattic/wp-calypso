/**
 * External dependencies
 */
import { merge, includes, concat } from 'lodash';

/**
 * Internal dependencies
 */
import { SITES_BLOG_STICKER_LIST_RECEIVE, SITES_BLOG_STICKER_ADD } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ SITES_BLOG_STICKER_LIST_RECEIVE ]: ( state, action ) => {
			return merge( {}, state, {
				[ action.payload.blogId ]: action.payload.stickers,
			} );
		},
		[ SITES_BLOG_STICKER_ADD ]: ( state, action ) => {
			const { blogId, stickerName } = action.payload;

			// If the blog already has this sticker, do nothing
			if ( includes( state[ blogId ], stickerName ) ) {
				return state;
			}

			return merge( {}, state, {
				[ blogId ]: state[ blogId ] ? concat( state[ blogId ], stickerName ) : [ stickerName ],
			} );
		},
	},
);

export default combineReducers( {
	items,
} );
