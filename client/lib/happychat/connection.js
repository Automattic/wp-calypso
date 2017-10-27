/** @format */

/**
 * External dependencies
 */
import IO from 'socket.io-client';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import {
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveMessage,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveUnauthorized,
	requestTranscript,
} from 'state/happychat/connection/actions';

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
	 * @param  { Promise } config   Will give us the user info
	 * @return { Promise } Fulfilled (returns the opened socket)
	 *                   	 or rejected (returns an error message)
	 */
	init( dispatch, config ) {
		if ( this.openSocket ) {
			debug( 'socket is already connected' );
			return this.openSocket;
		}
		this.dispatch = dispatch;

		this.openSocket = new Promise( ( resolve, reject ) => {
			config
				.then( ( { url, user: { signer_user_id, jwt, locale, groups, geoLocation } } ) => {
					const socket = buildConnection( url );
					socket
						.once( 'connect', () => dispatch( receiveConnect() ) )
						.on( 'token', handler => {
							dispatch( receiveToken() );
							handler( { signer_user_id, jwt, locale, groups } );
						} )
						.on( 'init', () => {
							dispatch( receiveInit( { signer_user_id, locale, groups, geoLocation } ) );
							dispatch( requestTranscript() );
							resolve( socket );
						} )
						.on( 'unauthorized', () => {
							socket.close();
							dispatch( receiveUnauthorized( 'User is not authorized' ) );
							reject( 'User is not authorized' );
						} )
						.on( 'disconnect', reason => dispatch( receiveDisconnect( reason ) ) )
						.on( 'reconnecting', () => dispatch( receiveReconnecting() ) )
						.on( 'status', status => dispatch( receiveStatus( status ) ) )
						.on( 'accept', accept => dispatch( receiveAccept( accept ) ) )
						.on( 'message', message => dispatch( receiveMessage( message ) ) );
				} )
				.catch( e => reject( e ) );
		} );

		return this.openSocket;
	}

	/**
	 * Given a Redux action, emits a SocketIO event.
	 *
	 * @param  { Object } action A Redux action with props
	 *                    {
	 *                  		event: SocketIO event name,
	 *                  	  payload: contents to be sent,
	 *                  	  error: message to be shown should the event fails to be sent,
	 *                  	}
	 * @return { Promise } Fulfilled (returns nothing)
	 *                     or rejected (returns an error message)
	 */
	send( action ) {
		if ( ! this.openSocket ) {
			return;
		}
		return this.openSocket.then(
			socket => socket.emit( action.event, action.payload ),
			e => {
				this.dispatch( receiveError( action.error + ': ' + e ) );
				// so we can relay the error message, for testing purposes
				return Promise.reject( e );
			}
		);
	}

	/**
	 *
	 * Given a Redux action and a timeout, emits a SocketIO event that request
	 * some info to the Happychat server.
	 *
	 * The request will dispatch an action upon:
	 *
	 * - socket callback was succesful: dispatch action.callback
	 * - socket callback was unsucessful: dispatch receiveError
	 * - socket callback didn't respond before timeout: dispatch action.callbackTimeout
	 *
	 * @param  { Object } action A Redux action with props
	 *                  	{
	 *                  		event: SocketIO event name,
	 *                  		payload: contents to be sent,
	 *                  		error: message to be shown should the event fails to be sent,
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
				// config a promise race
				const promiseRace = Promise.race( [
					new Promise( ( resolve, reject ) => {
						socket.emit( action.event, action.payload, ( e, result ) => {
							if ( e ) {
								return reject( new Error( e ) ); // socket promise resolution
							}
							return resolve( result ); // socket promise rejection
						} );
					} ),
					new Promise( ( resolve, reject ) =>
						setTimeout( () => {
							return reject( Error( 'timeout' ) ); // timeout promise rejection
						}, timeout )
					),
				] );

				// dispatch the result upon promise race resolution
				promiseRace.then(
					result => this.dispatch( action.callback( result ) ),
					e =>
						e.message === 'timeout'
							? this.dispatch( action.callbackTimeout() )
							: this.dispatch( receiveError( action.error + ': ' + e.message ) )
				);

				return promiseRace;
			},
			e => {
				this.dispatch( receiveError( action.error + ': ' + e ) );
				// so we can relay the error message, for testing purposes
				return Promise.reject( e );
			}
		);
	}
}

export default () => new Connection();
