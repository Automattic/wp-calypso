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
	CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_MUTING,
} from './follow-status';
import { combineReducers, createReducer } from 'state/utils';
import { key } from './utils';

/**
 * Tracks all known conversation following statuses.
 */
export const items = createReducer(
	{},
	{
		[ READER_CONVERSATION_FOLLOW ]: ( state, action ) => {
			state = assign( {}, state, {
				[ key(
					action.payload.siteId,
					action.payload.postId
				) ]: CONVERSATION_FOLLOW_STATUS_FOLLOWING,
			} );
			return state;
		},
	}
);

export default combineReducers( {
	items,
} );
