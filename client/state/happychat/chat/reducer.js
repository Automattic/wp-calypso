/** @format */

/**
 * External dependencies
 *
 * @format
 */
import { concat, filter, find, map, get, sortBy, takeRight } from 'lodash';
import validator from 'is-my-json-valid';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT_TIMEOUT,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_CHAT_STATUS,
} from 'state/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_MAX_STORED_MESSAGES,
} from 'state/happychat/constants';
import { combineReducers } from 'state/utils';
import { timelineSchema } from './schema';

export const lastActivityTimestamp = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE:
		case HAPPYCHAT_RECEIVE_EVENT:
			return Date.now();
	}
	return state;
};
lastActivityTimestamp.schema = { type: 'number' };

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
 * @return {Object}        Updated state
 *
 */
export const status = ( state = HAPPYCHAT_CHAT_STATUS_DEFAULT, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_CHAT_STATUS:
			return action.status;
	}
	return state;
};

/**
 * Returns a timeline event from the redux action
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const timelineEvent = ( state = {}, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_RECEIVE_EVENT:
			const event = action.event;
			return Object.assign(
				{},
				{
					id: event.id,
					source: event.source,
					message: event.text,
					name: event.user.name,
					image: event.user.avatarURL,
					timestamp: event.timestamp,
					user_id: event.user.id,
					type: get( event, 'type', 'message' ),
					links: get( event, 'meta.links' ),
				}
			);
	}
	return state;
};

const validateTimeline = validator( timelineSchema );
const sortTimeline = timeline => sortBy( timeline, event => parseInt( event.timestamp, 10 ) );

/**
 * Adds timeline events for happychat
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const timeline = ( state = [], action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return takeRight( state, HAPPYCHAT_MAX_STORED_MESSAGES );
		case DESERIALIZE:
			const valid = validateTimeline( state );
			if ( valid ) {
				return state;
			}
			return [];
		case HAPPYCHAT_RECEIVE_EVENT:
			// if meta.forOperator is set, skip so won't show to user
			if ( get( action, 'event.meta.forOperator', false ) ) {
				return state;
			}
			const event = timelineEvent( {}, action );
			const existing = find( state, ( { id } ) => event.id === id );
			return existing ? state : concat( state, [ event ] );
		case HAPPYCHAT_IO_REQUEST_TRANSCRIPT_TIMEOUT:
			return state;
		case HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE:
			const messages = filter( action.messages, message => {
				if ( ! message.id ) {
					return false;
				}

				// if meta.forOperator is set, skip so won't show to user
				if ( get( message, 'meta.forOperator', false ) ) {
					return false;
				}

				return ! find( state, { id: message.id } );
			} );
			return sortTimeline(
				state.concat(
					map( messages, message => {
						return Object.assign( {
							id: message.id,
							source: message.source,
							message: message.text,
							name: message.user.name,
							image: message.user.picture,
							timestamp: message.timestamp,
							user_id: message.user.id,
							type: get( message, 'type', 'message' ),
							links: get( message, 'meta.links' ),
						} );
					} )
				)
			);
	}
	return state;
};
timeline.hasCustomPersistence = true;

export default combineReducers( {
	status,
	timeline,
	lastActivityTimestamp,
} );
