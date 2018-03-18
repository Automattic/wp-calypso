/** @format **/

/**
 * External dependencies
 */
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_IO_INIT,
	HAPPYCHAT_IO_RECEIVE_ACCEPT,
	HAPPYCHAT_IO_RECEIVE_CONNECT,
	HAPPYCHAT_IO_RECEIVE_DISCONNECT,
	HAPPYCHAT_IO_RECEIVE_ERROR,
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT,
	HAPPYCHAT_IO_RECEIVE_MESSAGE,
	HAPPYCHAT_IO_RECEIVE_RECONNECTING,
	HAPPYCHAT_IO_RECEIVE_STATUS,
	HAPPYCHAT_IO_RECEIVE_TOKEN,
	HAPPYCHAT_IO_RECEIVE_UNAUTHORIZED,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT_TIMEOUT,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT,
	HAPPYCHAT_IO_SEND_MESSAGE_EVENT,
	HAPPYCHAT_IO_SEND_MESSAGE_LOG,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_IO_SEND_MESSAGE_USERINFO,
	HAPPYCHAT_IO_SEND_PREFERENCES,
	HAPPYCHAT_IO_SEND_TYPING,
} from 'state/action-types';
import { HAPPYCHAT_MESSAGE_TYPES } from 'state/happychat/constants';

/**
 * Returns an action object indicating that the connection is being stablished.
 *
 * @param { Promise } auth Authentication promise, will return the user info upon fulfillment
 * @return { Object } Action object
 */
export const initConnection = auth => ( { type: HAPPYCHAT_IO_INIT, auth } );

/**
 * Returns an action object for the connect event,
 * as it was received from Happychat.
 *
 * @return { Object } Action object
 */
export const receiveConnect = () => ( { type: HAPPYCHAT_IO_RECEIVE_CONNECT } );

/**
 * Returns an action object for the disconnect event,
 * as it was received from Happychat.
 *
 * @param { String } error The error
 * @return { Object } Action object
 */
export const receiveDisconnect = error => ( {
	type: HAPPYCHAT_IO_RECEIVE_DISCONNECT,
	error,
} );

/**
 * Returns an action object for the token event,
 * as it was received from Happychat.
 *
 * @return { Object } Action object
 */
export const receiveToken = () => ( { type: HAPPYCHAT_IO_RECEIVE_TOKEN } );

/**
 * Returns an action object for the init event, as received from Happychat.
 * Indicates that the connection is ready to be used.
 *
 * @param { Object } user User object received
 * @return { Object } Action object
 */
export const receiveInit = user => ( { type: HAPPYCHAT_IO_RECEIVE_INIT, user } );

/**
 * Returns an action object for the unauthorized event,
 * as it was received from Happychat
 *
 * @param { String } error Error reported
 * @return { Object } Action object
 */
export const receiveUnauthorized = error => ( {
	type: HAPPYCHAT_IO_RECEIVE_UNAUTHORIZED,
	error,
} );

/**
 * Returns an action object for the reconnecting event,
 * as it was received from Happychat.
 *
 * @return { Object } Action object
 */
export const receiveReconnecting = () => ( { type: HAPPYCHAT_IO_RECEIVE_RECONNECTING } );

/**
 * Returns an action object for the accept event indicating the system availability,
 * as it was received from Happychat.
 *
 * @param  { Object } isAvailable Whether Happychat is available
 * @return { Object } Action object
 */
export const receiveAccept = isAvailable => ( {
	type: HAPPYCHAT_IO_RECEIVE_ACCEPT,
	isAvailable,
} );

/**
 * Returns an action object for the accept event indicating the system availability,
 * as it was received from Happychat.
 *
 * @param  { Object } isAvailable Whether Happychat is available
 * @return { Object } Action object
 */
export const receiveLocalizedSupport = isAvailable => ( {
	type: HAPPYCHAT_IO_RECEIVE_LOCALIZED_SUPPORT,
	isAvailable,
} );

/**
 * Returns an action object for the message event,
 * as it was received from Happychat.
 *
 * @param  { Object } message Message received
 * @return { Object } Action object
 */
export const receiveMessage = message => ( { type: HAPPYCHAT_IO_RECEIVE_MESSAGE, message } );

/**
 * Returns an action object for the status event,
 * as it was received from Happychat.
 *
 * @param  { String } status New chat status
 * @return { Object } Action object
 */
export const receiveStatus = status => ( {
	type: HAPPYCHAT_IO_RECEIVE_STATUS,
	status,
} );

/**
 * Returns an action object with the error received from Happychat
 * upon trying to send an event.
 *
 * @param  { Object } error Error received
 * @return { Object } Action object
 */
export const receiveError = error => ( { type: HAPPYCHAT_IO_RECEIVE_ERROR, error } );

/**
 * Returns an action object for the transcript reception.
 *
 * @param { Object } result An object with {messages, timestamp} props
 * @return { Object } Action object
 */
export const receiveTranscript = ( { messages, timestamp } ) => ( {
	type: HAPPYCHAT_IO_REQUEST_TRANSCRIPT_RECEIVE,
	messages,
	timestamp,
} );

/**
 * Returns an action object for the timeout of the transcript request.
 *
 * @return { Object } Action object
 */
export const receiveTranscriptTimeout = () => ( {
	type: HAPPYCHAT_IO_REQUEST_TRANSCRIPT_TIMEOUT,
} );

/**
 * Returns an action object that prepares the transcript request
 * to be send to happychat as a SocketIO event.
 *
 * @param { String } timestamp Latest transcript timestamp
 * @param { Number } timeout The number of milliseconds to wait for server response.
 *                 	 If it hasn't responded after the timeout, the connection library
 *                 	 will dispatch the receiveTranscriptTimeout action.
 * @return { Object } Action object
 */
export const requestTranscript = ( timestamp, timeout = 10000 ) => ( {
	type: HAPPYCHAT_IO_REQUEST_TRANSCRIPT,
	event: 'transcript',
	payload: timestamp,
	timeout: timeout,
	callback: receiveTranscript,
	callbackTimeout: receiveTranscriptTimeout,
} );

/**
 * Returns an action object that prepares the chat message
 * to be send to Happychat as a SocketIO event.
 *
 * @param  { Object } message Message to be sent
 * @param  { Object } meta meta info to be sent along the message
 * @return { Object } Action object
 */
export const sendMessage = ( message, meta = {} ) => ( {
	type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	event: 'message',
	payload: { id: uuid(), text: message, meta },
} );

/**
 * Returns an action object that prepares the event message
 * to be send to Happychat as a SocketIO event.
 *
 * @param  { Object } message Message to be sent
 * @return { Object } Action object
 */
export const sendEvent = message => ( {
	type: HAPPYCHAT_IO_SEND_MESSAGE_EVENT,
	event: 'message',
	payload: {
		id: uuid(),
		text: message,
		type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_EVENT,
		meta: { forOperator: true, event_type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_EVENT },
	},
} );

/**
 * Returns an action object that prepares the log message
 * to be send to Happychat as a SocketIO event.
 *
 * @param  { Object } message Message to be sent
 * @return { Object } Action object
 */
export const sendLog = message => ( {
	type: HAPPYCHAT_IO_SEND_MESSAGE_LOG,
	event: 'message',
	payload: {
		id: uuid(),
		text: message,
		type: HAPPYCHAT_MESSAGE_TYPES.LOG,
		meta: { forOperator: true, event_type: HAPPYCHAT_MESSAGE_TYPES.LOG },
	},
} );

/**
 * Returns an action object that prepares the user information
 * to be send to Happychat as a SocketIO event.
 *
 * @param  { Object } info Selected user info
 * @return { Object } Action object
 */
export const sendUserInfo = info => ( {
	type: HAPPYCHAT_IO_SEND_MESSAGE_USERINFO,
	event: 'message',
	payload: {
		id: uuid(),
		type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_INFO,
		meta: {
			forOperator: true,
			...info,
		},
	},
} );

/**
 * Returns an action object that prepares the typing info
 * to be sent to Happychat as a SocketIO event.
 *
 * @param  { Object } message What the user is typing
 * @return { Object } Action object
 */
export const sendTyping = message => ( {
	type: HAPPYCHAT_IO_SEND_TYPING,
	event: 'typing',
	payload: {
		message,
	},
} );

/**
 * Returns an action object that prepares typing info (the user stopped typing)
 * to be sent to Happychat as a SocketIO event.
 *
 * @return { Object } Action object
 */
export const sendNotTyping = () => sendTyping( false );

/**
 * Returns an action object that prepares the user routing preferences (locale and groups)
 * to be send to happychat as a SocketIO event.
 *
 * @param { String } locale representing the user selected locale
 * @param { Array } groups of string happychat groups (wp.com, jpop) based on the site selected
 * @param { Object } skills object based on product and language ( formerly group and locale )
 *
 * @return { Object } Action object
 */
export const sendPreferences = ( locale, groups, skills ) => ( {
	type: HAPPYCHAT_IO_SEND_PREFERENCES,
	event: 'preferences',
	payload: {
		locale,
		groups,
		skills,
	},
} );
