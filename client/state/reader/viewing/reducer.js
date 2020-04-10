/**
 * Internal Dependencies
 */
import { SERIALIZE } from 'state/action-types';
import {
	READER_VIEW_FEED_POST_SET,
	READER_VIEW_FEED_POST_UNSET,
	READER_VIEW_FULL_POST_SET,
	READER_VIEW_FULL_POST_UNSET,
} from 'state/reader/action-types';
import { LASAGNA_SOCKET_DISCONNECTED } from 'state/lasagna/action-types';
import { combineReducers } from 'state/utils';

/**
 * List of post ids grouped by site id which are currently visible to user in feed
 *
 * @param state redux store
 * @param action redux action
 * @returns state map of site ids
 */
export const feed = ( state = {}, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case READER_VIEW_FULL_POST_SET:
		case LASAGNA_SOCKET_DISCONNECTED:
			return {};

		case READER_VIEW_FEED_POST_SET: {
			if ( ! action.payload || ! action.payload.siteId || ! action.payload.postId ) {
				return state;
			}

			const siteId = action.payload.siteId;
			const postId = action.payload.postId;
			const postsList = state[ action.payload.siteId ] ? state[ siteId ] : [];

			// keep unique list of post ids
			if ( postsList.indexOf( postId ) === -1 ) {
				postsList.push( postId );

				return {
					...state,
					[ siteId ]: postsList,
				};
			}

			return state;
		}

		case READER_VIEW_FEED_POST_UNSET: {
			if ( ! action.payload || ! action.payload.siteId || ! action.payload.postId ) {
				return state;
			}

			const siteId = action.payload.siteId;
			const postId = action.payload.postId;
			let postsList = state[ siteId ] ? state[ siteId ].filter( e => e !== postId ) : [];
			postsList = postsList.filter( e => e !== postId );
			return {
				...state,
				[ siteId ]: postsList,
			};
		}
	}

	return state;
};

/**
 * Id of the site currently viewed by the user in full-post page (detail)
 *
 * @param state redux state
 * @param action redux action
 * @returns {null|number} site id
 */
export const fullPost = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case LASAGNA_SOCKET_DISCONNECTED:
			return null;

		case READER_VIEW_FULL_POST_SET: {
			if ( ! action.payload || ! action.payload.siteId ) {
				return state;
			}

			return action.payload.siteId;
		}

		case READER_VIEW_FULL_POST_UNSET: {
			if ( ! action.payload || ! action.payload.siteId ) {
				return state;
			}

			return null;
		}
	}

	return state;
};

export default combineReducers( {
	feed,
	fullPost,
} );
