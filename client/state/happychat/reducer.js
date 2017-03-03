/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import get from 'lodash/get';
import find from 'lodash/find';
import concat from 'lodash/concat';
import filter from 'lodash/filter';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_RECEIVE_TRANSCRIPT
} from 'state/action-types';

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
			return [];
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_RECEIVE_EVENT:
			// if meta.forOperator is set, skip so won't show to user
			if ( get( action, 'event.meta.forOperator', false ) ) {
				return state;
			}
			const event = timeline_event( {}, action );
			const existing = find( state, ( { id } ) => event.id === id );
			return existing ? state : concat( state, [ event ] );
		case HAPPYCHAT_RECEIVE_TRANSCRIPT:
			const messages = filter( action.messages, message => {
				if ( ! message.id ) {
					return false;
				}
				return ! find( state, { id: message.id } );
			} );
			return state.concat( map( messages, message => {
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
			} ) );
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
const message = ( state = '', action ) => {
	switch ( action.type ) {
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
const connectionStatus = ( state = 'disconnected', action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return 'disconnected';
		case DESERIALIZE:
			return state;
		case HAPPYCHAT_CONNECTING:
			return 'connecting';
		case HAPPYCHAT_CONNECTED:
			return 'connected';
	}
	return state;
};

/**
 * Tracks the state of the happychat chat. Valid states
 *  - default : no chat has been started
 *  - pending : chat has been started but no operator assigned
 *  - assigning : system is assigning to an operator
 *  - assigned : operator has been connected to the chat
 *  - missed : no operator could be assigned
 *  - abandoned : operator was disconnected
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const chatStatus = ( state = 'default', action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return 'default';
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

export default combineReducers( { timeline, message, connectionStatus, chatStatus, isAvailable } );
