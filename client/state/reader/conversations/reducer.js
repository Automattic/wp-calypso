/**
 * External dependencies
 */
import { assign, forEach, omit, size } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_POSTS_RECEIVE,
} from 'state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from './follow-status';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { itemsSchema } from './schema';
import { key } from './utils';

/**
 * Tracks all known conversation following statuses.
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_CONVERSATION_FOLLOW: {
			const newState = assign( {}, state, {
				[ key(
					action.payload.siteId,
					action.payload.postId
				) ]: CONVERSATION_FOLLOW_STATUS.following,
			} );
			return newState;
		}
		case READER_CONVERSATION_MUTE: {
			const newState = assign( {}, state, {
				[ key( action.payload.siteId, action.payload.postId ) ]: CONVERSATION_FOLLOW_STATUS.muting,
			} );
			return newState;
		}
		case READER_CONVERSATION_UPDATE_FOLLOW_STATUS: {
			const stateKey = key( action.payload.siteId, action.payload.postId );

			// If followStatus is null, remove the key from the state map entirely
			if ( action.payload.followStatus === CONVERSATION_FOLLOW_STATUS.not_following ) {
				return omit( state, stateKey );
			}

			const newState = assign( {}, state, {
				[ stateKey ]: action.payload.followStatus,
			} );

			return newState;
		}
		case READER_POSTS_RECEIVE: {
			if ( ! action.posts ) {
				return state;
			}

			const newState = {};

			forEach( action.posts, ( post ) => {
				if ( post.is_following_conversation ) {
					newState[ key( post.site_ID, post.ID ) ] = CONVERSATION_FOLLOW_STATUS.following;
				}
			} );

			if ( size( newState ) === 0 ) {
				return state;
			}

			return { ...state, ...newState };
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
