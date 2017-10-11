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
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
} from 'state/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_MAX_STORED_MESSAGES,
} from 'state/happychat/constants';
import { combineReducers } from 'state/utils';
import { timelineSchema } from './schema';

export const lastActivityTimestamp = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SEND_MESSAGE:
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
 * Tracks the current message the user has typed into the happychat client
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const message = ( state = '', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SEND_MESSAGE:
			return '';
		case HAPPYCHAT_SET_MESSAGE:
			return action.message;
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
const timeline_event = ( state = {}, action ) => {
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
			const event = timeline_event( {}, action );
			const existing = find( state, ( { id } ) => event.id === id );
			return existing ? state : concat( state, [ event ] );
		case HAPPYCHAT_TRANSCRIPT_RECEIVE:
			const messages = filter( action.messages, msg => {
				if ( ! msg.id ) {
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
					map( messages, msg => {
						return Object.assign( {
							id: msg.id,
							source: msg.source,
							message: msg.text,
							name: msg.user.name,
							image: msg.user.picture,
							timestamp: msg.timestamp,
							user_id: msg.user.id,
							type: get( msg, 'type', 'message' ),
							links: get( msg, 'meta.links' ),
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
	message,
	lastActivityTimestamp,
} );
