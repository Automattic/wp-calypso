import debugFactory from 'debug';
import IO from 'socket.io-client';
import type {
	Action,
	HappychatUser,
	ConnectionProps,
	AvailabilityConnectionProps,
	HappychatAuth,
	Socket,
} from './types';

const debug = debugFactory( 'calypso:happychat:connection' );

const buildConnection: ( socket: string | Socket ) => Socket = ( socket ) =>
	typeof socket === 'string'
		? new IO( socket, {
				// force websocket connection since we no longer have sticky connections server side.
				transports: [ 'websocket' ],
		  } ) // If socket is an URL, connect to server.
		: socket; // If socket is not an url, use it directly. Useful for testing.

//The second one is an identity function, used in 'use-happychat-available' hook
export type Dispatch = ( ( arg: unknown ) => void ) | ( < T >( value: T ) => T );
export class Connection {
	receiveAccept?: ( accept: boolean ) => void;
	receiveConnect?: () => void;
	receiveDisconnect?: ( reason: string ) => void;
	receiveError?: ( error: string ) => void;
	receiveInit?: ( init: HappychatUser ) => void;
	receiveLocalizedSupport?: ( accept: boolean ) => void;
	receiveMessage?: ( message: string ) => void;
	receiveHappychatEnv?: ( env: 'production' | 'staging' ) => void;
	receiveMessageOptimistic?: ( message: string ) => void;
	receiveMessageUpdate?: ( message: string ) => void;
	receiveReconnecting?: () => void;
	receiveStatus?: ( status: string ) => void;
	receiveToken?: () => void;
	receiveUnauthorized?: ( message: string ) => void;
	requestTranscript?: () => void;
	closeAfterAccept: boolean;
	dispatch?: Dispatch;
	openSocket?: Promise< Socket >;

	constructor( props: ConnectionProps = {}, closeAfterAccept = false ) {
		Object.assign( this, props );
		this.closeAfterAccept = closeAfterAccept;
	}

	/**
	 * Init the SocketIO connection: check user authorization and bind socket events
	 *
	 * @param originalDispatch Redux dispatch function
	 * @param auth Authentication promise, will return the user info upon fulfillment
	 * @returns Fulfilled (returns the opened socket)
	 *                   	 or rejected (returns an error message)
	 */
	init( originalDispatch: Dispatch, auth: Promise< HappychatAuth > ) {
		if ( this.openSocket ) {
			debug( 'socket is already connected' );
			return this.openSocket;
		}

		const dispatch = ( action: unknown ) => {
			if ( action ) {
				return originalDispatch( action );
			}
		};

		this.dispatch = dispatch;

		this.openSocket = new Promise( ( resolve, reject ) => {
			auth
				.then( ( { url, user: { signer_user_id, jwt, groups, skills, geoLocation } } ) => {
					// not so clean way to check if the happychat URL is staging or prod one.
					if ( typeof url === 'string' ) {
						if ( url.includes( 'staging' ) ) {
							dispatch( this.receiveHappychatEnv?.( 'staging' ) );
						} else {
							dispatch( this.receiveHappychatEnv?.( 'production' ) );
						}
					}
					const socket = buildConnection( url );
					return socket
						.once( 'connect', () => dispatch( this.receiveConnect?.() ) )
						.on(
							'token',
							( handler: ( happychatUser: HappychatUser & { jwt: string } ) => void ) => {
								dispatch( this.receiveToken?.() );
								handler( { signer_user_id, jwt, groups, skills } );
							}
						)
						.on( 'init', () => {
							dispatch( this.receiveInit?.( { signer_user_id, groups, skills, geoLocation } ) );
							dispatch( this.requestTranscript?.() );
							resolve( socket );
						} )
						.on( 'unauthorized', () => {
							socket.close();
							dispatch( this.receiveUnauthorized?.( 'User is not authorized' ) );
							reject( 'user is not authorized' );
						} )
						.on( 'disconnect', ( reason: string ) =>
							dispatch( this.receiveDisconnect?.( reason ) )
						)
						.on( 'reconnecting', () => dispatch( this.receiveReconnecting?.() ) )
						.on( 'status', ( status: string ) => dispatch( this.receiveStatus?.( status ) ) )
						.on( 'accept', ( accept: boolean ) => {
							dispatch( this.receiveAccept?.( accept ) );
							if ( this.closeAfterAccept ) {
								socket.close();
							}
						} )
						.on( 'localized-support', ( accept: boolean ) =>
							dispatch( this.receiveLocalizedSupport?.( accept ) )
						)
						.on( 'message', ( message: string ) => dispatch( this.receiveMessage?.( message ) ) )
						.on( 'message.optimistic', ( message: string ) =>
							dispatch( this.receiveMessageOptimistic?.( message ) )
						)
						.on( 'message.update', ( message: string ) =>
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
	 * @param  {Object} action A Redux action with props
	 *                  	{
	 *                  		event: SocketIO event name,
	 *                  		payload: contents to be sent,
	 *                  		error: message to be shown should the event fails to be sent,
	 *                  	}
	 * @returns {Promise|undefined} Fulfilled (returns nothing) or rejected
	 *                              (returns an error message)
	 */
	send( action: Action ) {
		if ( ! this.openSocket ) {
			return;
		}

		return this.openSocket.then(
			( socket: Socket ) => socket.emit( action.event, action.payload ),
			( e: Error ) => {
				this.dispatch?.( this.receiveError?.( 'failed to send ' + action.event + ': ' + e ) );
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
	 * @param  {Object} action A Redux action with props
	 *                  	{
	 *                  		event: SocketIO event name,
	 *                  		payload: contents to be sent,
	 *                  		callback: a Redux action creator
	 *                  	}
	 * @param  {number} timeout How long (in milliseconds) has the server to respond
	 * @returns {Promise|undefined} Fulfilled (returns the transcript response)
	 *                              or rejected (returns an error message)
	 */
	request( action: Action, timeout: number ) {
		if ( ! this.openSocket ) {
			return;
		}

		return this.openSocket.then(
			( socket: Socket ) => {
				const promiseRace = Promise.race( [
					new Promise( ( resolve, reject ) => {
						socket.emit( action.event, action.payload, ( e: string, result: unknown ) => {
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
					( result ) => this.dispatch?.( action.callback?.( result ) ),
					( e: Error ) => {
						if ( e.message !== 'timeout' ) {
							this.dispatch?.(
								this.receiveError?.( action.event + ' request failed: ' + e.message )
							);
						}
					}
				);

				return promiseRace;
			},
			( e: Error ) => {
				this.dispatch?.( this.receiveError?.( 'failed to send ' + action.event + ': ' + e ) );
				// so we can relay the error message, for testing purposes
				return Promise.reject( e );
			}
		);
	}
}

// Used by the Help Center, it closes the socket after receiving 'accept' or 'unauthorized'
export const buildConnectionForCheckingAvailability = (
	connectionProps: AvailabilityConnectionProps
) => new Connection( connectionProps, false );

export default ( connectionProps: ConnectionProps ) => new Connection( connectionProps );
