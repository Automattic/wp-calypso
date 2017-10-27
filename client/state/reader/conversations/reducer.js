/** @format */
/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'state/action-types';
import {
	CONVERSATION_FOLLOW_STATUS_FOLLOWING,
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
			const newState = assign( {}, state, {
				[ key( action.payload.siteId, action.payload.postId ) ]: action.payload.followStatus,
			} );

			return newState;
		},
	},
	itemsSchema
);

export default combineReducers( {
	items,
} );
