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

	open( user_id, token, locale ) {
		if ( ! this.openSocket ) {
			this.openSocket = new Promise( resolve => {
				const url = config( 'happychat_url' );
				const socket = new IO( url );
				socket
					.once( 'connect', () => debug( 'connected' ) )
					.on( 'init', () => resolve( socket ) )
					.on( 'token', handler => {
						handler( { signer_user_id: user_id, jwt: token, locale } );
					} )
					.on( 'unauthorized', () => {
						socket.close();
						debug( 'not authorized' );
					} )
					// Received a chat message
					.on( 'message', message => this.emit( 'message', message ) )
					// Received chat status new/assigning/assigned/missed/pending/abandoned
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

	info( message ) {
		this.openSocket.then(
			socket => socket.emit( 'message', { text: message.text, id: uuid(), meta: { suppress: true } } ),
			e => debug( 'failed to send message', e )
		);
	}

	transcript( timestamp ) {
		return this.openSocket.then( socket => Promise.race( [
			new Promise( ( resolve, reject ) => {
				socket.emit( 'transcript', timestamp || null, ( e, result ) => {
					if ( e ) {
						return reject( new Error( e ) );
					}
					resolve( result );
				} );
			} ),
			new Promise( ( resolve, reject ) => setTimeout( () => {
				reject( Error( 'timeout' ) );
			}, 10000 ) )
		] ) );
	}

}

export default () => new Connection();
