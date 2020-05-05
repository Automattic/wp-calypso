/**
 * Provides functions to communicate with parent frame
 *
 * @module boot/messaging
 */
import debugFactory from 'debug';

import { parseJson } from '../panel/utils/parse-json';

const debug = debugFactory( 'notifications:messaging' );

/**
 * Handles an incoming message event
 *
 * @typedef {Function} MessageEventReceiver
 * @throws {TypeError} When no data or invalid data comes in on the event
 * @param {object} event incoming event
 * @returns {undefined}
 */

/**
 * Dispatches incoming messages from the parent frame
 *
 * The main purpose here is to validate incoming messages and
 * if the messages are valid to pass them down into the app
 * and to the functions which actually respond to the data
 * contained in the messages.
 *
 * @param {Function} receiver called with valid incoming messages
 * @returns {MessageEventReceiver}
 */
export const receiveMessage = ( receiver ) => ( event ) => {
	if ( ! window || ! event || event.source !== window.parent ) {
		return debug(
			'Unexpected or empty message received\n' + 'Messages must come from parent window.'
		);
	}

	if ( ! event.data ) {
		return debug(
			`No data received in message from ${ event.origin }\n` +
				'Maybe it was was accidentally forgotten'
		);
	}

	// any string data must be interpreted as JSON
	const data = 'string' === typeof event.data ? parseJson( event.data ) : event.data;

	if ( null === data && 'string' === typeof event.data ) {
		return debug(
			`Could not parse incoming string message data from ${ event.origin } as JSON\n` +
				'Incoming data must have key/value structure whether sent directly or serialized as JSON\n' +
				`Example data: "{ type: 'notesIframeMessage', action: 'clearNotesIndicator' }"\n` +
				`Actual received data: ${ event.data }`
		);
	}

	if ( ! data || data.type !== 'notesIframeMessage' ) {
		return debug(
			`Invalid incoming message from ${ event.origin }\n` +
				'All messages to this notifications client should indicate this is the right destination\n' +
				`Example data: "{ type: 'notesIframeMessage', action: 'clearNotesIndicator' }"`
		);
	}

	receiver( data );
};

/**
 * Sends outgoing messages to parent frame
 *
 * @param {object} message data to send
 * @returns {undefined}
 */
export const sendMessage = ( message ) => {
	if ( ! window || ! window.parent ) {
		return;
	}

	window.parent.postMessage(
		JSON.stringify( {
			...message,
			type: 'notesIframeMessage',
		} ),
		'*'
	);
};
