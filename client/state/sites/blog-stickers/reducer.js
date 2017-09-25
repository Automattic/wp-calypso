/**
 * External dependencies
 */
import { includes, concat, compact, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { SITES_BLOG_STICKER_LIST_RECEIVE, SITES_BLOG_STICKER_ADD, SITES_BLOG_STICKER_REMOVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ SITES_BLOG_STICKER_LIST_RECEIVE ]: ( state, action ) => {
			return {
				...state,
				[ action.payload.blogId ]: action.payload.stickers,
			};
		},
		[ SITES_BLOG_STICKER_ADD ]: ( state, action ) => {
			const { blogId, stickerName } = action.payload;

			// If the blog already has this sticker, do nothing
			if ( includes( state[ blogId ], stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: compact( concat( stickerName, state[ blogId ] ) ),
			};
		},
		[ SITES_BLOG_STICKER_REMOVE ]: ( state, action ) => {
			const { blogId, stickerName } = action.payload;

			// If the blog doesn't have this sticker, do nothing
			if ( ! includes( state[ blogId ], stickerName ) ) {
				return state;
			}

			return {
				...state,
				[ blogId ]: reject( state[ blogId ], sticker => sticker === stickerName ),
			};
		},
	},
);

export default combineReducers( {
	items,
} );
