/** @format */

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_ACTIVITY,
	HAPPYCHAT_IO_RECEIVE_MESSAGE,
	HAPPYCHAT_IO_RECEIVE_STATUS,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
} from 'state/action-types';
import { HAPPYCHAT_CHAT_STATUS_DEFAULT } from 'state/happychat/constants';
import { combineReducers } from 'state/utils';

// We compare incoming timestamps against a known future Unix time in seconds date
// to determine if the timestamp is in seconds or milliseconds resolution. If the former,
// we "upgrade" it by multiplying by 1000.
//
// This will all be removed once the server-side is fully converted.
const UNIX_TIMESTAMP_2023_IN_SECONDS = 1700000000;
export const maybeUpscaleTimePrecision = time =>
	time < UNIX_TIMESTAMP_2023_IN_SECONDS ? time * 1000 : time;

export const lastActivityTimestamp = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_ACTIVITY:
		case HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE:
		case HAPPYCHAT_IO_RECEIVE_MESSAGE:
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
		case HAPPYCHAT_IO_RECEIVE_STATUS:
			return action.status;
	}
	return state;
};

export default combineReducers( {
	status,
	lastActivityTimestamp,
} );
