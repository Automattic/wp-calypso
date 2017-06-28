/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { SITES_BLOG_STICKER_LIST_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ SITES_BLOG_STICKER_LIST_RECEIVE ]: ( state, action ) => {
			return merge( {}, state, {
				[ action.payload.blogId ]: action.payload.stickers,
			} );
		}
	}
);

export default combineReducers( {
	items,
} );
