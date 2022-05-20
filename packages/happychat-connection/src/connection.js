import debugFactory from 'debug';
import IO from 'socket.io-client';

const debug = debugFactory( 'calypso:happychat:connection' );

const buildConnection = ( socket ) =>
	typeof socket === 'string'
		? new IO( socket, {
				// force websocket connection since we no longer have sticky connections server side.
				transports: [ 'websocket' ],
		  } ) // If socket is an URL, connect to server.
		: socket; // If socket is not an url, use it directly. Useful for testing.

class Connection {
	constructor(
		receiveAccept,
		receiveConnect,
		receiveDisconnect,
		receiveError,
		receiveInit,
		receiveLocalizedSupport,
		receiveMessage,
		receiveMessageOptimistic,
		receiveMessageUpdate,
		receiveReconnecting,
		receiveStatus,
		receiveToken,
		receiveUnauthorized,
		requestTranscript
	) {
		this.receiveAccept = receiveAccept;
		this.receiveConnect = receiveConnect;
		this.receiveDisconnect = receiveDisconnect;
		this.receiveError = receiveError;
		this.receiveInit = receiveInit;
		this.receiveLocalizedSupport = receiveLocalizedSupport;
		this.receiveMessage = receiveMessage;
		this.receiveMessageOptimistic = receiveMessageOptimistic;
		this.receiveMessageUpdate = receiveMessageUpdate;
		this.receiveReconnecting = receiveReconnecting;
		this.receiveStatus = receiveStatus;
		this.receiveToken = receiveToken;
		this.receiveUnauthorized = receiveUnauthorized;
		this.requestTranscript = requestTranscript;
	}

	/**
	 * Init the SockeIO connection: check user authorization and bind socket events
	 *
	 * @param  { Function } dispatch Redux dispatch function
	 * @param  { Promise } auth Authentication promise, will return the user info upon fulfillment
	 * @returns { Promise } Fulfilled (returns the opened socket)
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
				.then( ( { url, user: { signer_user_id, jwt, locale, groups, skills, geoLocation } } ) => {
					const socket = buildConnection( url );

					socket
						.once( 'connect', () => dispatch( this.receiveConnect?.() ) )
						.on( 'token', ( handler ) => {
							dispatch( this.receiveToken?.() );
							handler( { signer_user_id, jwt, locale, groups, skills } );
						} )
						.on( 'init', () => {
							dispatch(
								this.receiveInit?.( { signer_user_id, locale, groups, skills, geoLocation } )
							);
							dispatch( this.requestTranscript?.() );
							resolve( socket );
						} )
						.on( 'unauthorized', () => {
							socket.close();
							dispatch( this.receiveUnauthorized?.( 'User is not authorized' ) );
							reject( 'user is not authorized' );
						} )
						.on( 'disconnect', ( reason ) => dispatch( this.receiveDisconnect?.( reason ) ) )
						.on( 'reconnecting', () => dispatch( this.receiveReconnecting?.() ) )
						.on( 'status', ( status ) => dispatch( this.receiveStatus?.( status ) ) )
						.on( 'accept', ( accept ) => dispatch( this.receiveAccept?.( accept ) ) )
						.on( 'localized-support', ( accept ) =>
							dispatch( this.receiveLocalizedSupport?.( accept ) )
						)
						.on( 'message', ( message ) => dispatch( this.receiveMessage?.( message ) ) )
						.on( 'message.optimistic', ( message ) =>
							dispatch( this.receiveMessageOptimistic?.( message ) )
						)
						.on( 'message.update', ( message ) =>
							dispatch( this.receiveMessageUpdate?.( message ) )
						)
						.on( 'reconnect_attempt', () => {
							socket.io.opts.transports = [ 'polling', 'websocket' ];
						} );
				} )
				.catch( ( e ) => reject( e ) );
		} );

		return this.openSocket;
	}

	/**
	 * Given a Redux action, emits a SocketIO event.
	 *
	 * @param  {object} action A Redux action with props
	 *                    {
	 *                  		event: SocketIO event name,
	 *                  	  payload: contents to be sent,
	 *                  	  error: message to be shown should the event fails to be sent,
	 *                  	}
	 * @returns { Promise } Fulfilled (returns nothing)
	 *                     or rejected (returns an error message)
	 */
	send( action ) {
		if ( ! this.openSocket ) {
			return;
		}

		return this.openSocket.then(
			( socket ) => socket.emit( action.event, action.payload ),
			( e ) => {
				this.dispatch( this.receiveError?.( 'failed to send ' + action.event + ': ' + e ) );
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
	 * The request can have three states, and will dispatch an action accordingly:
	 *
	 * - request was succesful: would dispatch action.callback
	 * - request was unsucessful: would dispatch receiveError
	 *
	 * @param  {object} action A Redux action with props
	 *                  	{
	 *                  		event: SocketIO event name,
	 *                  		payload: contents to be sent,
	 *                  		callback: a Redux action creator
	 *                  	}
	 * @param  {number} timeout How long (in milliseconds) has the server to respond
	 * @returns { Promise } Fulfilled (returns the transcript response)
	 *                     or rejected (returns an error message)
	 */
	request( action, timeout ) {
		if ( ! this.openSocket ) {
			return;
		}

		return this.openSocket.then(
			( socket ) => {
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
					( result ) => this.dispatch( action.callback( result ) ),
					( e ) => {
						if ( e.message !== 'timeout' ) {
							this.dispatch(
								this.receiveError?.( action.event + ' request failed: ' + e.message )
							);
						}
					}
				);

				return promiseRace;
			},
			( e ) => {
				this.dispatch( this.receiveError?.( 'failed to send ' + action.event + ': ' + e ) );
				// so we can relay the error message, for testing purposes
				return Promise.reject( e );
			}
		);
	}
}

export default (
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveLocalizedSupport,
	receiveMessage,
	receiveMessageOptimistic,
	receiveMessageUpdate,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveUnauthorized,
	requestTranscript
) =>
	new Connection(
		receiveAccept,
		receiveConnect,
		receiveDisconnect,
		receiveError,
		receiveInit,
		receiveLocalizedSupport,
		receiveMessage,
		receiveMessageOptimistic,
		receiveMessageUpdate,
		receiveReconnecting,
		receiveStatus,
		receiveToken,
		receiveUnauthorized,
		requestTranscript
	);
