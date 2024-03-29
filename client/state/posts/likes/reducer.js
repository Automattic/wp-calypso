import {
	POST_LIKERS_RECEIVE,
	POST_LIKES_ADD_LIKER,
	POST_LIKES_RECEIVE,
	POST_LIKES_REMOVE_LIKER,
	POST_LIKE,
	POST_UNLIKE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import itemSchema from './schema';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID keys to the post's likes.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const itemReducer = withSchemaValidation(
	itemSchema,
	( state = { likes: undefined, iLike: false, found: 0, lastUpdated: undefined }, action ) => {
		/*
		 * NOTE: This reducer includes some subtle, non-obvious behavior.
		 * The key thing to be aware of is that likes is undefined by default,
		 * and we only fetch the likes data in specific situations:
		 *  - when we explicitly request and then receive likes for a post, we get a `POST_LIKERS_RECEIVE` action.
		 *  - when we like a post, the response handling triggers a `POST_LIKES_ADD_LIKER` action.
		 *  - when we unlike a post, the response handling triggers a `POST_LIKES_REMOVE_LIKER` action.
		 * However, those fetches can be laggy, so we only update the likes data for those specific actions.
		 * Conversely, we only update the iLike and found values for the other actions:
		 *  - `POST_LIKE`
		 *  - `POST_LIKES_RECEIVE`
		 *  - `POST_UNLIKE`
		 */
		switch ( action.type ) {
			case POST_LIKERS_RECEIVE: {
				const { likes } = action;

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
						: undefined,
					// Make sure we're keeping any existing values.
					found: state.found,
					iLike: state.iLike,
					lastUpdated: state.lastUpdated,
				};
			}
			case POST_LIKES_RECEIVE: {
				const { iLike, found } = action;
				return {
					iLike,
					found,
					likes: state.likes,
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
				const { liker } = action;
				const existingLikes = state?.likes ?? [];
				const hasLiker = existingLikes.some( ( like ) => like.ID === liker.ID );

				if ( hasLiker ) {
					// if we already have this liker, no changes are needed.
					return state;
				}

				return {
					// Add the requested liker to the list of likes.
					likes: [ liker, ...existingLikes ],
					// Leave everything else as-is.
					iLike: state.iLike,
					found: state.found,
					lastUpdated: state.lastUpdated,
				};
			}
			case POST_LIKES_REMOVE_LIKER: {
				const { liker } = action;
				const existingLikes = state?.likes ?? [];
				const hasLiker = existingLikes.some( ( like ) => like.ID === liker.ID );

				if ( ! hasLiker ) {
					// if we don't have this liker, no changes are needed.
					return state;
				}

				return {
					// Remove the requested liker from the list of likes.
					likes: existingLikes.filter( ( existingLike ) => existingLike.ID !== liker.ID ),
					// Leave everything else as-is.
					iLike: state.iLike,
					found: state.found,
					lastUpdated: state.lastUpdated,
				};
			}
		}

		return state;
	}
);

export const items = keyedReducer( 'siteId', keyedReducer( 'postId', itemReducer ) );

export default combineReducers( {
	items,
} );
