/**
 * Internal dependencies
 */
import { HAPPYCHAT_BLUR, HAPPYCHAT_CONNECT, HAPPYCHAT_CONNECTING, HAPPYCHAT_CONNECTED, HAPPYCHAT_DISCONNECTED, HAPPYCHAT_INITIALIZE, HAPPYCHAT_FOCUS, HAPPYCHAT_RECEIVE_EVENT, HAPPYCHAT_RECONNECTING, HAPPYCHAT_SEND_USER_INFO, HAPPYCHAT_SEND_MESSAGE, HAPPYCHAT_SET_AVAILABLE, HAPPYCHAT_SET_CHAT_STATUS, HAPPYCHAT_SET_MESSAGE, HAPPYCHAT_TRANSCRIPT_RECEIVE, HAPPYCHAT_TRANSCRIPT_REQUEST, HAPPYCHAT_SET_GEO_LOCATION } from 'state/action-types';

export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS, status
} );
export const requestChatTranscript = () => ( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );
export const receiveChatTranscript = ( messages, timestamp ) => ( {
	type: HAPPYCHAT_TRANSCRIPT_RECEIVE, messages, timestamp
} );

export const initialize = () => ( { type: HAPPYCHAT_INITIALIZE } );

export const blur = () => ( { type: HAPPYCHAT_BLUR } );
export const focus = () => ( { type: HAPPYCHAT_FOCUS } );

export const connectChat = () => ( { type: HAPPYCHAT_CONNECT } );
export const setConnected = () => ( { type: HAPPYCHAT_CONNECTED } );
export const setConnecting = () => ( { type: HAPPYCHAT_CONNECTING } );
export const setDisconnected = errorStatus => ( { type: HAPPYCHAT_DISCONNECTED, errorStatus } );
export const setReconnecting = () => ( { type: HAPPYCHAT_RECONNECTING } );

export const setHappychatAvailable = isAvailable => ( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable } );

export const setChatMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
export const clearChatMessage = () => setChatMessage( '' );

export const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );

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
		site
	};
};

export const sendChatMessage = message => ( { type: HAPPYCHAT_SEND_MESSAGE, message } );

/**
 * Returns an action object to be used in signalling that the current user geo location
 * has been set.
 *
 * @param  {Object} geoLocation Geo location information based on ip
 * @return {Object}        Action object
 */
export function setGeoLocation( geoLocation ) {
	return {
		type: HAPPYCHAT_SET_GEO_LOCATION,
		geoLocation
	};
}
