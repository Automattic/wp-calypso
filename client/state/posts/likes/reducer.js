/** @format */

/**
 * External dependencies
 */

import { dropWhile, get, pick, some } from 'lodash';

/**
 * Internal dependencies
 */
import itemsSchema from './schema';
import { combineReducers, createReducer } from 'state/utils';
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
		[ POST_LIKE ]: ( state, { siteId, postId } ) => {
			const currentLike = get( state, [ siteId, postId ], {
				likes: undefined,
				iLike: false,
				found: 0,
			} );

			if ( currentLike.iLike ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						likes: currentLike.likes,
						iLike: true,
						found: currentLike.found + 1,
					},
				},
			};
		},
		[ POST_UNLIKE ]: ( state, { siteId, postId } ) => {
			const currentLike = get( state, [ siteId, postId ], undefined );
			if ( ! currentLike ) {
				return state;
			}

			if ( ! currentLike.iLike ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						likes: currentLike.likes,
						iLike: false,
						found: currentLike.found - 1,
					},
				},
			};
		},
		[ POST_LIKES_ADD_LIKER ]: ( state, { siteId, postId, likeCount, liker } ) => {
			const currentLike = get( state, [ siteId, postId ], {
				likes: undefined,
				iLike: false,
				found: 0,
			} );

			const hasLiker = some( currentLike.likes, like => like.ID === liker.ID );

			if ( currentLike.likeCount === likeCount && hasLiker ) {
				// if the like count matches and we already have this liker, bail
				return state;
			}

			let likes = currentLike.likes;
			if ( ! hasLiker ) {
				likes = [ liker, ...( currentLike.likes || [] ) ];
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						likes,
						iLike: currentLike.iLike,
						found: likeCount,
					},
				},
			};
		},
		[ POST_LIKES_REMOVE_LIKER ]: ( state, { siteId, postId, likeCount, liker } ) => {
			const currentLike = get( state, [ siteId, postId ], {
				likes: undefined,
				iLike: false,
				found: 0,
			} );

			const hasLiker = some( currentLike.likes, like => like.ID === liker.ID );

			if ( currentLike.likeCount === likeCount && ! hasLiker ) {
				// if the like count matches and we don't have this liker, bail
				return state;
			}

			let likes = currentLike.likes;
			if ( hasLiker ) {
				likes = dropWhile( currentLike.likes, l => liker.ID === l.ID );
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						likes,
						iLike: currentLike.iLike,
						found: likeCount,
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
