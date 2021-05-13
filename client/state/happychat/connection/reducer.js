/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_IO_INIT,
	HAPPYCHAT_IO_RECEIVE_ACCEPT,
	HAPPYCHAT_IO_RECEIVE_DISCONNECT,
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT,
	HAPPYCHAT_IO_RECEIVE_RECONNECTING,
} from 'calypso/state/action-types';
import {
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
} from 'calypso/state/happychat/constants';
import { combineReducers } from 'calypso/state/utils';

const error = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_INIT:
			return null;
		case HAPPYCHAT_IO_RECEIVE_DISCONNECT:
			return action.error;
	}
	return state;
};

/**
 * Tracks the state of the happychat client connection
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 *
 */
const status = ( state = HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_INIT:
			return HAPPYCHAT_CONNECTION_STATUS_CONNECTING;
		case HAPPYCHAT_IO_RECEIVE_INIT:
			return HAPPYCHAT_CONNECTION_STATUS_CONNECTED;
		case HAPPYCHAT_IO_RECEIVE_DISCONNECT:
			return HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED;
		case HAPPYCHAT_IO_RECEIVE_RECONNECTING:
			return HAPPYCHAT_CONNECTION_STATUS_RECONNECTING;
	}
	return state;
};

/**
 * Tracks whether happychat.io is accepting new chats.
 *
 * @param  {boolean} state  Current happychat status
 * @param  {object}  action Action playload
 * @returns {boolean}        Updated happychat status
 */
const isAvailable = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_ACCEPT:
			return action.isAvailable;
	}
	return state;
};

/**
 * Tracks whether happychat.io is accepting fully localized chats.
 * Customers locale and HE locale should be an exact match ( doesn't default routing to english speaker HEs )
 *
 * @param  {boolean} state  Current happychat status
 * @param  {object}  action Action playload
 * @returns {boolean}        Updated happychat status
 */
export const localizedSupport = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT:
			return action.isAvailable;
	}
	return state;
};

export default combineReducers( {
	error,
	isAvailable,
	localizedSupport,
	status,
} );
