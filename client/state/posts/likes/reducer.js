/** @format */

/**
 * External dependencies
 */

import { dropWhile, pick, some } from 'lodash';

/**
 * Internal dependencies
 */
import itemSchema from './schema';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	POST_LIKES_ADD_LIKER,
	POST_LIKES_RECEIVE,
	POST_LIKES_REMOVE_LIKER,
	POST_LIKE,
	POST_UNLIKE,
} from 'state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID keys to the post's likes.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const itemReducer = createReducer(
	{ likes: undefined, iLike: false, found: 0 },
	{
		[ POST_LIKES_RECEIVE ]: ( state, { likes, iLike, found } ) => {
			return {
				likes: likes.map( like =>
					pick( like, 'ID', 'avatar_URL', 'login', 'name', 'site_ID', 'site_visible' )
				),
				iLike,
				found,
			};
		},
		[ POST_LIKE ]: state => {
			if ( state.iLike ) {
				return state;
			}

			return {
				likes: state.likes,
				iLike: true,
				found: state.found + 1,
			};
		},
		[ POST_UNLIKE ]: state => {
			if ( ! state.iLike ) {
				return state;
			}

			return {
				likes: state.likes,
				iLike: false,
				found: Math.max( 0, state.found - 1 ),
			};
		},
		[ POST_LIKES_ADD_LIKER ]: ( state, { likeCount, liker } ) => {
			const hasLiker = some( state.likes, like => like.ID === liker.ID );

			if ( state.likeCount === likeCount && hasLiker ) {
				// if the like count matches and we already have this liker, bail
				return state;
			}

			let likes = state.likes;
			if ( ! hasLiker ) {
				likes = [ liker, ...( state.likes || [] ) ];
			}

			return {
				likes,
				iLike: state.iLike,
				found: likeCount,
			};
		},
		[ POST_LIKES_REMOVE_LIKER ]: ( state, { likeCount, liker } ) => {
			const hasLiker = some( state.likes, like => like.ID === liker.ID );

			if ( state.likeCount === likeCount && ! hasLiker ) {
				// if the like count matches and we don't have this liker, bail
				return state;
			}

			let likes = state.likes;
			if ( hasLiker ) {
				likes = dropWhile( state.likes, l => liker.ID === l.ID );
			}

			return {
				likes,
				iLike: state.iLike,
				found: likeCount,
			};
		},
	},
	itemSchema
);

const postIdReducer = keyedReducer( 'postId', itemReducer );
postIdReducer.hasCustomPersistence = true;
export const items = keyedReducer( 'siteId', postIdReducer );
items.hasCustomPersistence = true;

export default combineReducers( {
	items,
} );
