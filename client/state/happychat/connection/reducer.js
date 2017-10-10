/** @format **/
/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECONNECTING,
} from 'state/action-types';
import { combineReducers } from 'state/utils';

const error = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_CONNECTED:
			return null;
		case HAPPYCHAT_DISCONNECTED:
			return action.errorStatus;
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
const status = ( state = 'uninitialized', action ) => {
	switch ( action.type ) {
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

/**
 * Tracks whether happychat.io is accepting new chats.
 *
 * @param  {Boolean} state  Current happychat status
 * @param  {Object}  action Action playload
 * @return {Boolean}        Updated happychat status
 */
const isAvailable = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_AVAILABLE:
			return action.isAvailable;
	}
	return state;
};

export default combineReducers( {
	error,
	status,
	isAvailable,
} );
