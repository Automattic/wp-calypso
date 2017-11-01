/**
 * External dependencies
 *
 * @format
 */

import IO from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_MESSAGE_TYPES } from 'state/happychat/constants';
import {
	receiveChatEvent,
	receiveError,
	requestTranscript,
	setConnected,
	setDisconnected,
	setHappychatAvailable,
	setReconnecting,
} from 'state/happychat/connection/actions';
import { setHappychatChatStatus } from 'state/happychat/chat/actions';

const debug = require( 'debug' )( 'calypso:happychat:connection' );

const buildConnection = socket =>
	isString( socket )
		? new IO( socket ) // If socket is an URL, connect to server.
		: socket; // If socket is not an url, use it directly. Useful for testing.

class Connection {
	/**
	 * Init the SockeIO connection: check user authorization and bind socket events
	 *
	 * @param  { Function } dispatch Redux dispatch function
	 * @param  { Promise } auth Authentication promise, will return the user info upon fulfillment
	 * @return { Promise } Fulfilled (returns the opened socket)
	 *                   	 or rejected (returns an error message)
	 */
	init( dispatch, auth ) {
		if ( this.openSocket ) {
			debug( 'socket is already connected' );
			return this.openSocket;
		}
		this.dispatch = dispatch;

		this.openSocket = new Promise( ( resolve, reject ) => {
			auth
				.then( ( { url, user: { signer_user_id, jwt, locale, groups, geoLocation } } ) => {
					const socket = buildConnection( url );

					socket
						.once( 'connect', () => debug( 'connected' ) )
						.on( 'token', handler => handler( { signer_user_id, jwt, locale, groups } ) )
						.on( 'init', () => {
							dispatch( setConnected( { signer_user_id, locale, groups, geoLocation } ) );
							dispatch( requestTranscript() );
							resolve( socket );
						} )
						.on( 'unauthorized', () => {
							socket.close();
							reject( 'user is not authorized' );
						} )
						.on( 'disconnect', reason => dispatch( setDisconnected( reason ) ) )
						.on( 'reconnecting', () => dispatch( setReconnecting() ) )
						.on( 'status', status => dispatch( setHappychatChatStatus( status ) ) )
						.on( 'accept', accept => dispatch( setHappychatAvailable( accept ) ) )
						.on( 'message', message => dispatch( receiveChatEvent( message ) ) );
				} )
				.catch( e => reject( e ) );
		} );

		return this.openSocket;
	}

	typing( message ) {
		this.openSocket.then(
			socket => socket.emit( 'typing', { message } ),
			e => debug( 'failed to send typing', e )
		);
	}

	notTyping() {
		this.openSocket.then(
			socket => socket.emit( 'typing', false ),
			e => debug( 'failed to send typing', e )
		);
	}

	send( message, meta = {} ) {
		this.openSocket.then(
			socket => socket.emit( 'message', { text: message, id: uuid(), meta } ),
			e => debug( 'failed to send message', e )
		);
	}

	sendEvent( message ) {
		this.openSocket.then(
			socket =>
				socket.emit( 'message', {
					text: message,
					id: uuid(),
					type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_EVENT,
					meta: { forOperator: true, event_type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_EVENT },
				} ),
			e => debug( 'failed to send message', e )
		);
	}

	/**
	 * Update chat preferences (locale and groups)
	 * @param {string} locale representing the user selected locale
	 * @param {array} groups of string happychat groups (wp.com, jpop) based on the site selected
	 */
	setPreferences( locale, groups ) {
		this.openSocket.then(
			socket => socket.emit( 'preferences', { locale, groups } ),
			e => debug( 'failed to send preferences', e )
		);
	}

	sendLog( message ) {
		this.openSocket.then(
			socket =>
				socket.emit( 'message', {
					text: message,
					id: uuid(),
					type: HAPPYCHAT_MESSAGE_TYPES.LOG,
					meta: { forOperator: true, event_type: HAPPYCHAT_MESSAGE_TYPES.LOG },
				} ),
			e => debug( 'failed to send message', e )
		);
	}

	/**
	 * Send customer and browser information
	 * @param { Object } info selected form fields, customer date time, user agent and browser info
	 */
	sendInfo( info ) {
		this.openSocket.then(
			socket =>
				socket.emit( 'message', {
					id: uuid(),
					meta: { ...info, forOperator: true },
					type: HAPPYCHAT_MESSAGE_TYPES.CUSTOMER_INFO,
				} ),
			e => debug( 'failed to send message', e )
		);
	}

	/**
	 *
	 * Given a Redux action and a timeout, emits a SocketIO event that request
	 * some info to the Happychat server.
	 *
	 * The request can have three states, and will dispatch an action accordingly:
	 *
	 * - request was succesful: would dispatch action.callback
	 * - request was unsucessful: would dispatch receiveError
	 * - request timeout: would dispatch action.callbackTimeout
	 *
	 * @param  { Object } action A Redux action with props
	 *                  	{
	 *                  		event: SocketIO event name,
	 *                  		payload: contents to be sent,
	 *                  		callback: a Redux action creator,
	 *                  		callbackTimeout: a Redux action creator,
	 *                  	}
	 * @param  { Number } timeout How long (in milliseconds) has the server to respond
	 * @return { Promise } Fulfilled (returns the transcript response)
	 *                     or rejected (returns an error message)
	 */
	request( action, timeout ) {
		if ( ! this.openSocket ) {
			return;
		}

		return this.openSocket.then(
			socket => {
				const promiseRace = Promise.race( [
					new Promise( ( resolve, reject ) => {
						socket.emit( action.event, action.payload, ( e, result ) => {
							if ( e ) {
								return reject( new Error( e ) ); // request failed
							}
							return resolve( result ); // request succesful
						} );
					} ),
					new Promise( ( resolve, reject ) =>
						setTimeout( () => {
							return reject( new Error( 'timeout' ) ); // request timeout
						}, timeout )
					),
				] );

				// dispatch the request state upon promise race resolution
				promiseRace.then(
					result => this.dispatch( action.callback( result ) ),
					e =>
						e.message === 'timeout'
							? this.dispatch( action.callbackTimeout() )
							: this.dispatch( receiveError( action.event + ' request failed: ' + e.message ) )
				);

				return promiseRace;
			},
			e => {
				this.dispatch( receiveError( 'failed to send ' + action.event + ': ' + e ) );
				// so we can relay the error message, for testing purposes
				return Promise.reject( e );
			}
		);
	}
}

export default () => new Connection();
