import { combineReducers } from 'redux';
import get from 'lodash/get';
import find from 'lodash/find';
import concat from 'lodash/concat';

import {
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED
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
				message: event.text,
				name: event.user.name,
				image: event.user.avatarURL,
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
			const event = timeline_event( {}, action );
			const existing = find( state, ( { id } ) => event.id === id );
			return existing ? state : concat( state, [ event ] );
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
const status = ( state = 'disconnected', action ) => {
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
 * Tracks the availability of happychat. If not available, happychat should
 * not be displayed or made accessible to users.
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

export default combineReducers( { timeline, message, status, isAvailable } );
