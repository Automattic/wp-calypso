/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import {
	concat,
	filter,
	find,
	map,
	get,
	sortBy,
	takeRight,
} from 'lodash';
import validator from 'is-my-json-valid';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
} from 'state/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
} from './selectors';
import { HAPPYCHAT_MAX_STORED_MESSAGES } from './constants';
import { timelineSchema } from './schema';

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
			return Object.assign( {}, {
				id: event.id,
				source: event.source,
				message: event.text,
				name: event.user.name,
				image: event.user.avatarURL,
				timestamp: event.timestamp,
				user_id: event.user.id,
				type: get( event, 'type', 'message' ),
				links: get( event, 'meta.links' )
			} );
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
const timeline = ( state = [], action ) => {
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
			return sortTimeline( state.concat( map( messages, message => {
				return Object.assign( {
					id: message.id,
					source: message.source,
					message: message.text,
					name: message.user.name,
					image: message.user.picture,
					timestamp: message.timestamp,
					user_id: message.user.id,
					type: get( message, 'type', 'message' ),
					links: get( message, 'meta.links' )
				} );
			} ) ) );
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
 * Tracks the state of the happychat client connection
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const connectionStatus = ( state = 'uninitialized', action ) => {
	switch ( action.type ) {
		case DESERIALIZE:
			// Always boot up in the uninitialized state
			return 'uninitialized';
		case HAPPYCHAT_CONNECTING:
			return 'connecting';
		case HAPPYCHAT_CONNECTED:
			return 'connected';
		case HAPPYCHAT_DISCONNECTED:
			return 'disconnected';
		case HAPPYCHAT_RECONNECTING:
			return 'reconnecting';
	}
	return state;
};

const connectionError = ( state = null, action ) => {
	switch ( action.type ) {
		case DESERIALIZE:
			return null;
		case HAPPYCHAT_CONNECTED:
			return null;
		case HAPPYCHAT_DISCONNECTED:
			return action.errorStatus;
	}
	return state;
};

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
const chatStatus = ( state = HAPPYCHAT_CHAT_STATUS_DEFAULT, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return HAPPYCHAT_CHAT_STATUS_DEFAULT;
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_SET_CHAT_STATUS:
			return action.status;
	}
	return state;
};

/**
 * Tracks wether happychat.io is accepting new chats.
 *
 * @param  {Boolean} state  Current happychat status
 * @param  {Object}  action Action playload
 * @return {Boolean}        Updated happychat status
 */
const isAvailable = ( state = false, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_SET_AVAILABLE:
			return action.isAvailable;
	}
	return state;
};

export const lastActivityTimestamp = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_SEND_MESSAGE:
		case HAPPYCHAT_RECEIVE_EVENT:
			return Date.now();
	}
	return state;
};

/**
 * Tracks the last time Happychat had focus. This lets us determine things like
 * whether the user has unread messages. A numerical value is the timestamp where focus
 * was lost, and `null` means HC currently has focus.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const lostFocusAt = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			// If there's already a timestamp set, use that. Otherwise treat a SERIALIZE as a
			// "loss of focus" since it represents the state when the browser (and HC) closed.
			if ( state === null ) {
				return Date.now();
			}
			return state;
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_BLUR:
			return Date.now();
		case HAPPYCHAT_FOCUS:
			return null;
	}
	return state;
};

export default combineReducers( {
	chatStatus,
	connectionError,
	connectionStatus,
	isAvailable,
	lastActivityTimestamp,
	lostFocusAt,
	message,
	timeline,
} );
