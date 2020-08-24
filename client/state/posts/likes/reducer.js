/**
 * External dependencies
 */
import { dropWhile, some } from 'lodash';

/**
 * Internal dependencies
 */
import itemSchema from './schema';
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const itemReducer = withSchemaValidation(
	itemSchema,
	( state = { likes: undefined, iLike: false, found: 0, lastUpdated: undefined }, action ) => {
		switch ( action.type ) {
			case POST_LIKES_RECEIVE: {
				const { likes, iLike, found } = action;
				return {
					likes: Array.isArray( likes )
						? likes.map( ( like ) => {
								return {
									ID: like.ID,
									avatar_URL: like.avatar_URL,
									login: like.login,
									name: like.name,
									site_ID: like.site_ID,
									site_visible: like.site_visible,
								};
						  } )
						: state.likes,
					iLike,
					found,
					lastUpdated: Date.now(),
				};
			}
			case POST_LIKE: {
				if ( state.iLike ) {
					return state;
				}

				return {
					likes: state.likes,
					iLike: true,
					found: state.found + 1,
					lastUpdated: state.lastUpdated,
				};
			}
			case POST_UNLIKE: {
				if ( ! state.iLike ) {
					return state;
				}

				return {
					likes: state.likes,
					iLike: false,
					found: Math.max( 0, state.found - 1 ),
					lastUpdated: state.lastUpdated,
				};
			}
			case POST_LIKES_ADD_LIKER: {
				const { likeCount, liker } = action;
				const hasLiker = some( state.likes, ( like ) => like.ID === liker.ID );

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
					lastUpdated: state.lastUpdated,
				};
			}
			case POST_LIKES_REMOVE_LIKER: {
				const { likeCount, liker } = action;
				const hasLiker = some( state.likes, ( like ) => like.ID === liker.ID );

				if ( state.likeCount === likeCount && ! hasLiker ) {
					// if the like count matches and we don't have this liker, bail
					return state;
				}

				let likes = state.likes;
				if ( hasLiker ) {
					likes = dropWhile( state.likes, ( l ) => liker.ID === l.ID );
				}

				return {
					likes,
					iLike: state.iLike,
					found: likeCount,
					lastUpdated: state.lastUpdated,
				};
			}
		}

		return state;
	}
);

const postIdReducer = keyedReducer( 'postId', itemReducer );
postIdReducer.hasCustomPersistence = true;
export const items = keyedReducer( 'siteId', postIdReducer );
items.hasCustomPersistence = true;

export default combineReducers( {
	items,
} );
