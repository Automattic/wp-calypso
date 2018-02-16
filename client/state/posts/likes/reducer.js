/** @format */

/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import itemsSchema from './schema';
import { combineReducers, createReducer } from 'state/utils';
import { POST_LIKES_RECEIVE } from 'state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID keys to the post's likes.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ POST_LIKES_RECEIVE ]: ( state, { siteId, postId, likes, iLike, found } ) => {
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						likes: likes.map( like =>
							pick( like, 'ID', 'avatar_URL', 'login', 'name', 'site_ID', 'site_visible' )
						),
						iLike,
						found,
					},
				},
			};
		},
	},
	itemsSchema
);

export default combineReducers( {
	items,
} );
