/** @format **/

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CONNECT,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_INITIALIZE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SEND_USER_INFO,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';

export const connectChat = () => ( { type: HAPPYCHAT_CONNECT } );

export const initialize = () => ( { type: HAPPYCHAT_INITIALIZE } );

export const setConnected = user => ( { type: HAPPYCHAT_CONNECTED, user } );

export const setConnecting = () => ( { type: HAPPYCHAT_CONNECTING } );

export const setDisconnected = errorStatus => ( { type: HAPPYCHAT_DISCONNECTED, errorStatus } );

export const setReconnecting = () => ( { type: HAPPYCHAT_RECONNECTING } );

export const setHappychatAvailable = isAvailable => ( {
	type: HAPPYCHAT_SET_AVAILABLE,
	isAvailable,
} );

export const sendChatMessage = ( message, meta ) => ( {
	type: HAPPYCHAT_SEND_MESSAGE,
	message,
	meta,
} );

/**
 * Returns an action object that sends information about the customer to happychat
 *
 * @param  { String } howCanWeHelp Selected value of `How can we help?` form input
 * @param  { String } howYouFeel Selected value of `Mind sharing how you feel?` form input
 * @param  { Object } site Selected site info
 * @return { Object } Action object
 */
export const sendUserInfo = ( howCanWeHelp, howYouFeel, site ) => {
	return {
		type: HAPPYCHAT_SEND_USER_INFO,
		howCanWeHelp,
		howYouFeel,
		site,
	};
};

export const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );

export const requestChatTranscript = () => ( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );

export const receiveChatTranscript = ( messages, timestamp ) => ( {
	type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
	messages,
	timestamp,
} );
