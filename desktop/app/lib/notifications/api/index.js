/*
 * External dependencies
 */
const WebSocket = require( 'ws' );
const EventEmitter = require( 'events' ).EventEmitter;

/*
 * Internal dependencies
 */
const keychain = require( '../../../lib/keychain' );
const { fetchNote, markReadStatus } = require( './notes' );
const log = require( '../../../lib/logger' )( 'desktop:notifications:api' );

/*
 * Module constants
 */
const pingMs = 30000; // Pinghub ping measured at ~27s during testing

class WPNotificationsAPI extends EventEmitter {
	constructor() {
		super();
	}

	heartbeat() {
		clearTimeout( this.pingTimeout );

		this.pingTimeout = setTimeout( () => {
			log.info( 'Websock heartbeat timed out, attempting to reconnect...' );
			this.ws.terminate();
			this.connect();
			// heartbeat timeout: server ping interval + conservative assumption of latency.
		}, pingMs + 1000 );
	}

	async connect( cookie ) {
		// If a cookie value was not explicitly passed in, let's try to fetch it from the keychain
		if ( ! cookie ) {
			cookie = await keychain.fetch( 'wp_api_sec' );
		}

		if ( ! cookie ) {
			log.info( 'Failed to initialize websocket: missing wp_api_sec cookie' );
			this.ws = null;
			return;
		}

		this.ws = new WebSocket(
			'https://public-api.wordpress.com/pinghub/wpcom/me/newest-note-data',
			[],
			{
				headers: {
					Origin: `https://public-api.wordpress.com`,
					Cookie: `wp_api_sec=${ decodeURIComponent( cookie ) }`,
				},
			}
		);

		this.ws.on( 'open', () => {
			log.info( 'Websocket connected' );
			this.heartbeat();
		} );

		this.ws.on( 'ping', () => {
			log.debug( 'Websocket ping' );
			this.heartbeat();
		} );

		this.ws.on( 'close', () => {
			log.info( 'Websocket disconnected' );
			clearTimeout( this.pingTimeout );
		} );

		this.ws.on( 'error', ( error ) => {
			log.info( 'Websocket error: ', error );
		} );

		this.ws.on( 'message', async ( message ) => {
			const json = JSON.parse( message );
			log.debug( 'Received message: ', json );

			const { note_id: noteId } = json;
			if ( ! noteId ) {
				return;
			}

			try {
				const note = await fetchNote( noteId );
				log.debug( 'Parsed note: ', note );
				this.emit( 'note', note );
			} catch ( e ) {
				log.error( `Failed to fetch note with id: ${ noteId }: `, e );
			}
		} );
	}

	async markNoteAsRead( noteId, callback ) {
		try {
			await markReadStatus( noteId, true );
			if ( callback ) {
				callback();
			}
		} catch ( e ) {
			log.error( 'Failed to mark note as read:', e );
		}
	}

	disconnect() {
		if ( this.ws ) {
			this.ws.terminate();
			this.ws = null;
		}
	}
}

module.exports = new WPNotificationsAPI();
