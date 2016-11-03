/**
 * External dependencies
 */
import IO from 'socket.io-client';
import { EventEmitter } from 'events';
import config from 'config';
import { v4 as uuid } from 'uuid';

/*
 * Happychat client connection for Socket.IO
 */
const debug = require( 'debug' )( 'calypso:happychat:connection' );

class Connection extends EventEmitter {

	open( user_id, token ) {
		if ( ! this.openSocket ) {
			this.openSocket = new Promise( resolve => {
				const url = config( 'happychat_url' );
				const socket = new IO( url );
				socket
					.once( 'connect', () => resolve( socket ) )
					.on( 'init', ( ... args ) => debug( 'initialized', ... args ) )
					.on( 'token', handler => {
						handler( { signer_user_id: user_id, jwt: token } );
					} )
					// Received a typing indicator
					.on( 'typing', isTyping => debug( 'operator typing?', isTyping ) )
					// Received a chat message
					.on( 'message', message => this.emit( 'message', message ) )
					// Received back log of chat
					.on( 'log', log => debug( 'received log', log ) )
					// Received chat status new/assigning/assigned/missed
					.on( 'status', status => this.emit( 'status', status ) )
					// If happychat is currently accepting chats
					.on( 'accept', accept => this.emit( 'accept', accept ) );
			} );
		} else {
			debug( 'socket already initiaized' );
		}
		return this.openSocket;
	}

	typing( message ) {
		this.openSocket
		.then(
			socket => socket.emit( 'typing', { message } ),
			e => debug( 'failed to send typing', e )
		);
	}

	notTyping() {
		this.openSocket
		.then(
			socket => socket.emit( 'typing', false ),
			e => debug( 'failed to send typing', e )
		);
	}

	send( message ) {
		this.openSocket.then(
			socket => socket.emit( 'message', { text: message, id: uuid() } ),
			e => debug( 'failed to send message', e )
		);
	}

}

export default () => new Connection();
