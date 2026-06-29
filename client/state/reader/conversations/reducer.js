import { omit } from '@automattic/js-utils';
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { CONVERSATION_FOLLOW_STATUS } from './follow-status';
import { itemsSchema } from './schema';
import { key } from './utils';

/**
 * Tracks all known conversation following statuses.
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_CONVERSATION_FOLLOW: {
			const newState = {
				...state,
				[ key( action.payload.siteId, action.payload.postId ) ]:
					CONVERSATION_FOLLOW_STATUS.following,
			};
			return newState;
		}
		case READER_CONVERSATION_MUTE: {
			const newState = {
				...state,
				[ key( action.payload.siteId, action.payload.postId ) ]: CONVERSATION_FOLLOW_STATUS.muting,
			};
			return newState;
		}
		case READER_CONVERSATION_UPDATE_FOLLOW_STATUS: {
			const stateKey = key( action.payload.siteId, action.payload.postId );

			// If followStatus is null, remove the key from the state map entirely
			if ( action.payload.followStatus === CONVERSATION_FOLLOW_STATUS.not_following ) {
				return omit( state, stateKey );
			}

			const newState = {
				...state,
				[ stateKey ]: action.payload.followStatus,
			};

			return newState;
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
