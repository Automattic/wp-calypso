/** @format */

/**
 * External dependencies
 */
import { Socket } from 'phoenix';
import { isString } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveLocalizedSupport,
	receiveMessage,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveUnauthorized,
	requestTranscript,
} from 'state/happychat/connection/actions';

const debug = debugFactory( 'calypso:happychat:connection' );

const buildConnection = ( urlOrMock, authedUserId, jwt ) =>
	isString( urlOrMock )
		? new Socket( urlOrMock, { params: { customer_id: authedUserId, token: jwt } } ) // If socket is an URL, connect to server.
		: urlOrMock; // If socket is not an url, use it directly. Useful for testing.

class Connection {
	/**
	 * Init the SocketIO connection: check user authorization and bind socket events
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
				.then( ( { url, user } ) => {
					const { authed_user_id: authedUserId, jwt, locale, groups, skills, geoLocation } = user;
					const socket = buildConnection( url, authedUserId, jwt );

					socket.onOpen( () => dispatch( receiveConnect() ) );
					socket.onError( () => dispatch( receiveReconnecting() ) );
					socket.onClose( () => dispatch( receiveDisconnect( 'Connection closed.' ) ) );

					this.channel = socket.channel( `customers:${ authedUserId }`, user );

					this.channel.on( 'token', handler => {
						dispatch( receiveToken() );
						handler( { authedUserId, jwt, locale, groups, skills } );
					} );

					this.channel.on( 'init', () => {
						dispatch( receiveInit( { authedUserId, locale, groups, skills, geoLocation } ) );
						dispatch( requestTranscript() );
						resolve( socket );
					} );

					this.channel.on( 'unauthorized', () => {
						socket.close();
						dispatch( receiveUnauthorized( 'User is not authorized' ) );
						reject( 'user is not authorized' );
					} );

					this.channel.on( 'status', status => dispatch( receiveStatus( status ) ) );
					this.channel.on( 'accept', ( { can_accept: canAccept } ) =>
						dispatch( receiveAccept( canAccept ) )
					);
					this.channel.on( 'localized-support', accept =>
						dispatch( receiveLocalizedSupport( accept ) )
					);
					this.channel.on( 'message', message => dispatch( receiveMessage( message ) ) );

					socket.connect();
					this.channel.join();
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
		return this.channel.push( action.event, action.payload ).receive( 'error', reasons => {
			this.dispatch( receiveError( 'failed to send ' + action.event + ': ' + reasons ) );
			// so we can relay the error message, for testing purposes
			return Promise.reject( Error( reasons ) );
		} );
	}
}

export default () => new Connection();
