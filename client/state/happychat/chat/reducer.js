import {
	HAPPYCHAT_IO_RECEIVE_MESSAGE,
	HAPPYCHAT_IO_RECEIVE_MESSAGE_OPTIMISTIC,
	HAPPYCHAT_IO_RECEIVE_MESSAGE_UPDATE,
	HAPPYCHAT_IO_RECEIVE_STATUS,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
} from 'calypso/state/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_MAX_STORED_MESSAGES,
} from 'calypso/state/happychat/constants';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { timelineSchema } from './schema';

// We compare incoming timestamps against a known future Unix time in seconds date
// to determine if the timestamp is in seconds or milliseconds resolution. If the former,
// we "upgrade" it by multiplying by 1000.
//
// This will all be removed once the server-side is fully converted.
const UNIX_TIMESTAMP_2023_IN_SECONDS = 1700000000;
export const maybeUpscaleTimePrecision = ( time ) =>
	time < UNIX_TIMESTAMP_2023_IN_SECONDS ? time * 1000 : time;

const lastActivityTimestampSchema = { type: 'number' };
export const lastActivityTimestamp = withSchemaValidation(
	lastActivityTimestampSchema,
	( state = null, action ) => {
		switch ( action.type ) {
			case HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE:
			case HAPPYCHAT_IO_RECEIVE_MESSAGE:
				return Date.now();
		}
		return state;
	}
);

/**
 * Tracks the state of the happychat chat. Valid states are:
 *
 *  - HAPPYCHAT_CHAT_STATUS_DEFAULT : no chat has been started
 *  - HAPPYCHAT_CHAT_STATUS_PENDING : chat has been started but no operator assigned
 *  - HAPPYCHAT_CHAT_STATUS_ASSIGNING : system is assigning to an operator
 *  - HAPPYCHAT_CHAT_STATUS_ASSIGNED : operator has been connected to the chat
 *  - HAPPYCHAT_CHAT_STATUS_MISSED : no operator could be assigned
 *  - HAPPYCHAT_CHAT_STATUS_ABANDONED : operator was disconnected
 *  - HAPPYCHAT_CHAT_STATUS_CLOSED : chat was closed
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const status = ( state = HAPPYCHAT_CHAT_STATUS_DEFAULT, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_STATUS:
			return action.status;
	}
	return state;
};

/**
 * Returns a timeline event from the redux action
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const timelineEvent = ( state = {}, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_MESSAGE:
		case HAPPYCHAT_IO_RECEIVE_MESSAGE_OPTIMISTIC:
		case HAPPYCHAT_IO_RECEIVE_MESSAGE_UPDATE: {
			const { message } = action;
			return {
				id: message.id,
				source: message.source,
				message: message.text,
				name: message.user.name,
				image: message.user.avatarURL,
				isEdited: !! message.revisions,
				isOptimistic: message.isOptimistic,
				files: message.files,
				timestamp: maybeUpscaleTimePrecision( message.timestamp ),
				user_id: message.user.id,
				type: message.type ?? 'message',
				links: message.meta?.links,
			};
		}
	}
	return state;
};

const getEventTimestamp = ( event ) => parseInt( event.timestamp, 10 );
const timelineSortCmp = ( a, b ) => getEventTimestamp( a ) - getEventTimestamp( b );
const sortTimeline = ( timeline ) => timeline.slice().sort( timelineSortCmp );

/**
 * Adds timeline events for happychat
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const timelineReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_MESSAGE:
		case HAPPYCHAT_IO_RECEIVE_MESSAGE_OPTIMISTIC: {
			// if meta.forOperator is set, skip so won't show to user
			if ( action.message.meta?.forOperator ) {
				return state;
			}
			const event = timelineEvent( {}, action );

			// If the message already exists in the timeline, replace it
			const idx = state.findIndex( ( { id } ) => event.id === id );
			if ( idx >= 0 ) {
				return [ ...state.slice( 0, idx ), event, ...state.slice( idx + 1 ) ];
			}

			// This is a new message — append it!
			return state.concat( [ event ] );
		}
		case HAPPYCHAT_IO_RECEIVE_MESSAGE_UPDATE: {
			const index = state.findIndex( ( { id } ) => action.message.id === id );
			return index === -1
				? state
				: [ ...state.slice( 0, index ), timelineEvent( {}, action ), ...state.slice( index + 1 ) ];
		}
		case HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE: {
			const messages =
				action.messages?.filter( ( message ) => {
					if ( ! message.id ) {
						return false;
					}

					// if meta.forOperator is set, skip so won't show to user
					if ( message.meta?.forOperator ) {
						return false;
					}

					return ! state.some( ( event ) => event.id === message.id );
				} ) ?? [];
			return sortTimeline(
				state.concat(
					messages.map( ( message ) => ( {
						id: message.id,
						source: message.source,
						message: message.text,
						name: message.user.name,
						image: message.user.picture,
						isEdited: !! message.revisions,
						files: message.files,
						timestamp: maybeUpscaleTimePrecision( message.timestamp ),
						user_id: message.user.id,
						type: message.type ?? 'message',
						links: message.meta?.links,
					} ) )
				)
			);
		}
	}
	return state;
};

export const timeline = withSchemaValidation(
	timelineSchema,
	withPersistence( timelineReducer, {
		serialize: ( state ) => state.slice( -1 * HAPPYCHAT_MAX_STORED_MESSAGES ),
	} )
);

export default combineReducers( {
	status,
	timeline,
	lastActivityTimestamp,
} );
