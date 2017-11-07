/** @format */
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
} from 'state/action-types';
import {
	CONVERSATION_FOLLOW_STATUS_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_MUTING,
} from './follow-status';
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import { key } from './utils';

/**
 * Tracks all known conversation following statuses.
 */
export const items = createReducer(
	{},
	{
		[ READER_CONVERSATION_FOLLOW ]: ( state, action ) => {
			const newState = assign( {}, state, {
				[ key(
					action.payload.siteId,
					action.payload.postId
				) ]: CONVERSATION_FOLLOW_STATUS_FOLLOWING,
			} );
			return newState;
		},
		[ READER_CONVERSATION_MUTE ]: ( state, action ) => {
			const newState = assign( {}, state, {
				[ key( action.payload.siteId, action.payload.postId ) ]: CONVERSATION_FOLLOW_STATUS_MUTING,
			} );
			return newState;
		},
		[ READER_CONVERSATION_UPDATE_FOLLOW_STATUS ]: ( state, action ) => {
			const stateKey = key( action.payload.siteId, action.payload.postId );

			// If followStatus is null, remove the key from the state map entirely
			if ( action.payload.followStatus === CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING ) {
				return omit( state, stateKey );
			}

			const newState = assign( {}, state, {
				[ stateKey ]: action.payload.followStatus,
			} );

			return newState;
		},
		[ READER_POSTS_RECEIVE ]: ( state, action ) => {
			if ( ! action.posts ) {
				return state;
			}

			const newState = {};

			forEach( action.posts, post => {
				if ( post.is_following_conversation ) {
					newState[ key( post.site_ID, post.ID ) ] = CONVERSATION_FOLLOW_STATUS_FOLLOWING;
				}
			} );

			if ( size( newState ) === 0 ) {
				return state;
			}

			return { ...state, ...newState };
		},
	},
	itemsSchema
);

export default combineReducers( {
	items,
} );
