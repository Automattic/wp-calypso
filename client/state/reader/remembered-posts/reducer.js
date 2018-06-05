/** @format */
/**
 * External dependencies
 */
import { assign, forEach, omit, size } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_REMEMBERED_POSTS_REMEMBER,
	READER_REMEMBERED_POSTS_FORGET,
	READER_REMEMBERED_POSTS_UPDATE_STATUS,
	READER_POSTS_RECEIVE,
} from 'state/action-types';
import { READER_REMEMBERED_POSTS_STATUS } from './status';
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import { key } from './utils';

/**
 * Tracks all known conversation following statuses.
 */
export const items = createReducer(
	{},
	{
		[ READER_REMEMBERED_POSTS_REMEMBER ]: ( state, action ) => {
			const newState = assign( {}, state, {
				[ key(
					action.payload.siteId,
					action.payload.postId
				) ]: READER_REMEMBERED_POSTS_STATUS.following,
			} );
			return newState;
		},
		[ READER_REMEMBERED_POSTS_FORGET ]: ( state, action ) => {
			const newState = assign( {}, state, {
				[ key(
					action.payload.siteId,
					action.payload.postId
				) ]: READER_REMEMBERED_POSTS_STATUS.remembered,
			} );
			return newState;
		},
		[ READER_REMEMBERED_POSTS_UPDATE_STATUS ]: ( state, action ) => {
			const stateKey = key( action.payload.siteId, action.payload.postId );

			// If status is null, remove the key from the state map entirely
			if ( action.payload.status === READER_REMEMBERED_POSTS_STATUS.forgotten ) {
				return omit( state, stateKey );
			}

			const newState = assign( {}, state, {
				[ stateKey ]: action.payload.status,
			} );

			return newState;
		},
		[ READER_POSTS_RECEIVE ]: ( state, action ) => {
			if ( ! action.posts ) {
				return state;
			}

			const newState = {};

			forEach( action.posts, post => {
				if ( post.is_remembered ) {
					newState[ key( post.site_ID, post.ID ) ] = READER_REMEMBERED_POSTS_STATUS.remembered;
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
