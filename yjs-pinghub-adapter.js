/**
 * YJS-Pinghub Adapter
 *
 * This adapter allows YJS documents to use Pinghub as the WebSocket transport
 * instead of the standard y-websocket implementation. It translates between
 * YJS binary operational transform messages and Pinghub's JSON message format.
 */

import * as Y from 'yjs';

/**
 * YJS-Pinghub Adapter Class
 *
 * Bridges YJS collaborative editing with Pinghub's proven WebSocket infrastructure
 */
export class YjsPinghubAdapter {
	/**
	 * @param {string} pinghubChannel - Channel path like "/rtc/site-123/doc-456"
	 * @param {Y.Doc} ydoc - YJS document instance
	 * @param {Object} options - Configuration options
	 */
	constructor( pinghubChannel, ydoc, options = {} ) {
		this.channel = pinghubChannel;
		this.doc = ydoc;
		this.options = {
			pinghubUrl: options.pinghubUrl || '/pinghub',
			reconnectDelay: options.reconnectDelay || 1000,
			maxReconnectAttempts: options.maxReconnectAttempts || 10,
			...options,
		};

		// Connection state
		this.ws = null;
		this.isConnected = false;
		this.reconnectAttempts = 0;
		this.reconnectTimer = null;

		// YJS awareness for cursor/selection tracking
		this.awareness = new Y.YAwareness( this.doc );

		// Message queues
		this.pendingMessages = [];
		this.isInitialSyncComplete = false;

		// Bind methods
		this.handlePinghubMessage = this.handlePinghubMessage.bind( this );
		this.handleYjsUpdate = this.handleYjsUpdate.bind( this );
		this.handleAwarenessUpdate = this.handleAwarenessUpdate.bind( this );
		this.handleConnectionOpen = this.handleConnectionOpen.bind( this );
		this.handleConnectionClose = this.handleConnectionClose.bind( this );
		this.handleConnectionError = this.handleConnectionError.bind( this );

		// Set up YJS event listeners
		this.setupYjsListeners();

		// Start connection
		this.connect();
	}

	/**
	 * Set up YJS document and awareness event listeners
	 */
	setupYjsListeners() {
		// Listen for document updates (actual content changes)
		this.doc.on( 'update', this.handleYjsUpdate );

		// Listen for awareness updates (cursors, selections, user presence)
		this.awareness.on( 'update', this.handleAwarenessUpdate );

		// Set local awareness state (user info, cursor color, etc.)
		this.awareness.setLocalStateField( 'user', {
			name: this.options.userName || 'Anonymous',
			color: this.options.userColor || this.generateUserColor(),
			colorLight: this.options.userColorLight || this.generateUserColor( true ),
		} );
	}

	/**
	 * Generate a random color for user cursors/selections
	 * @param {boolean} light - Whether to generate a light variant
	 * @returns {string} Hex color
	 */
	generateUserColor( light = false ) {
		const hue = Math.floor( Math.random() * 360 );
		const saturation = light ? 30 : 70;
		const lightness = light ? 90 : 50;
		return `hsl(${ hue }, ${ saturation }%, ${ lightness }%)`;
	}

	/**
	 * Establish WebSocket connection to Pinghub
	 */
	connect() {
		if ( this.ws ) {
			return; // Already connected or connecting
		}

		const pinghubUrl = `${ this.options.pinghubUrl }${ this.channel }`;

		console.log( `[YJS-Pinghub] Connecting to: ${ pinghubUrl }` );

		try {
			// For WordPress.com domains, cookies are automatically included
			this.ws = new WebSocket(
				pinghubUrl.startsWith( 'ws' ) ? pinghubUrl : `ws://${ window.location.host }${ pinghubUrl }`
			);

			// Set up event listeners
			this.ws.addEventListener( 'open', this.handleConnectionOpen );
			this.ws.addEventListener( 'message', this.handlePinghubMessage );
			this.ws.addEventListener( 'close', this.handleConnectionClose );
			this.ws.addEventListener( 'error', this.handleConnectionError );
		} catch ( error ) {
			console.error( '[YJS-Pinghub] Connection failed:', error );
			this.scheduleReconnect();
		}
	}

	/**
	 * Handle WebSocket connection open
	 */
	handleConnectionOpen() {
		console.log( '[YJS-Pinghub] Connected successfully' );
		this.isConnected = true;
		this.reconnectAttempts = 0;

		// Send any pending messages
		this.flushPendingMessages();

		// Perform initial sync - send our current document state
		this.sendInitialSync();

		// Emit connection event for external listeners
		this.emit( 'connected' );
	}

	/**
	 * Handle WebSocket connection close
	 * @param {CloseEvent} event
	 */
	handleConnectionClose( event ) {
		console.log( `[YJS-Pinghub] Connection closed: ${ event.code } - ${ event.reason }` );
		this.isConnected = false;
		this.ws = null;

		// Clear awareness state when disconnected
		this.awareness.setLocalState( null );

		// Schedule reconnection unless it was a clean close
		if ( event.code !== 1000 ) {
			this.scheduleReconnect();
		}

		this.emit( 'disconnected', event );
	}

	/**
	 * Handle WebSocket connection error
	 * @param {Event} error
	 */
	handleConnectionError( error ) {
		console.error( '[YJS-Pinghub] Connection error:', error );
		this.emit( 'error', error );
	}

	/**
	 * Handle incoming messages from Pinghub
	 * @param {MessageEvent} event
	 */
	handlePinghubMessage( event ) {
		try {
			const message = JSON.parse( event.data );

			// Route different message types
			switch ( message.type ) {
				case 'yjs-update':
					this.handleYjsUpdateMessage( message );
					break;
				case 'yjs-awareness':
					this.handleYjsAwarenessMessage( message );
					break;
				case 'yjs-sync-request':
					this.handleYjsSyncRequest( message );
					break;
				case 'yjs-sync-response':
					this.handleYjsSyncResponse( message );
					break;
				default:
					console.warn( '[YJS-Pinghub] Unknown message type:', message.type );
			}
		} catch ( error ) {
			console.error( '[YJS-Pinghub] Failed to parse message:', error, event.data );
		}
	}

	/**
	 * Handle YJS document update from remote peer
	 * @param {Object} message
	 */
	handleYjsUpdateMessage( message ) {
		if ( message.clientId === this.doc.clientID ) {
			return; // Ignore our own messages
		}

		try {
			const update = new Uint8Array( message.update );
			Y.applyUpdate( this.doc, update );
		} catch ( error ) {
			console.error( '[YJS-Pinghub] Failed to apply update:', error );
		}
	}

	/**
	 * Handle YJS awareness update from remote peer
	 * @param {Object} message
	 */
	handleYjsAwarenessMessage( message ) {
		if ( message.clientId === this.doc.clientID ) {
			return; // Ignore our own messages
		}

		try {
			const update = new Uint8Array( message.awarenessUpdate );
			Y.YAwareness.applyAwarenessUpdate( this.awareness, update, message.clientId );
		} catch ( error ) {
			console.error( '[YJS-Pinghub] Failed to apply awareness update:', error );
		}
	}

	/**
	 * Handle sync request from remote peer
	 * @param {Object} message
	 */
	handleYjsSyncRequest( message ) {
		// Send our current document state to the requesting peer
		const stateVector = Y.encodeStateVector( this.doc );
		this.sendToPinghub( {
			type: 'yjs-sync-response',
			stateVector: Array.from( stateVector ),
			clientId: this.doc.clientID,
			requestId: message.requestId,
		} );
	}

	/**
	 * Handle sync response from remote peer
	 * @param {Object} message
	 */
	handleYjsSyncResponse( message ) {
		try {
			const stateVector = new Uint8Array( message.stateVector );
			const diff = Y.encodeStateAsUpdate( this.doc, stateVector );

			if ( diff.length > 0 ) {
				// Send missing updates to the peer
				this.sendToPinghub( {
					type: 'yjs-update',
					update: Array.from( diff ),
					clientId: this.doc.clientID,
				} );
			}
		} catch ( error ) {
			console.error( '[YJS-Pinghub] Failed to handle sync response:', error );
		}
	}

	/**
	 * Handle YJS document updates (outgoing)
	 * @param {Uint8Array} update
	 * @param {Object} origin
	 */
	handleYjsUpdate( update, origin ) {
		// Don't send updates that originated from network
		if ( origin === this ) {
			return;
		}

		this.sendToPinghub( {
			type: 'yjs-update',
			update: Array.from( update ),
			clientId: this.doc.clientID,
		} );
	}

	/**
	 * Handle YJS awareness updates (outgoing)
	 * @param {Object} param0
	 */
	handleAwarenessUpdate( { added, updated, removed } ) {
		const changedClients = added.concat( updated ).concat( removed );

		if ( changedClients.includes( this.doc.clientID ) ) {
			const update = Y.YAwareness.encodeAwarenessUpdate( this.awareness, changedClients );

			this.sendToPinghub( {
				type: 'yjs-awareness',
				awarenessUpdate: Array.from( update ),
				clientId: this.doc.clientID,
			} );
		}
	}

	/**
	 * Send initial sync request to get current document state from peers
	 */
	sendInitialSync() {
		this.sendToPinghub( {
			type: 'yjs-sync-request',
			requestId: `sync-${ Date.now() }-${ Math.random() }`,
			clientId: this.doc.clientID,
		} );
	}

	/**
	 * Send a message to Pinghub
	 * @param {Object} message
	 */
	sendToPinghub( message ) {
		const jsonMessage = JSON.stringify( message );

		if ( this.isConnected && this.ws ) {
			this.ws.send( jsonMessage );
		} else {
			// Queue message for when connection is restored
			this.pendingMessages.push( jsonMessage );
		}
	}

	/**
	 * Flush any pending messages after connection is restored
	 */
	flushPendingMessages() {
		while ( this.pendingMessages.length > 0 ) {
			const message = this.pendingMessages.shift();
			this.ws.send( message );
		}
	}

	/**
	 * Schedule reconnection attempt
	 */
	scheduleReconnect() {
		if ( this.reconnectAttempts >= this.options.maxReconnectAttempts ) {
			console.error( '[YJS-Pinghub] Max reconnection attempts reached' );
			this.emit( 'max-reconnects-reached' );
			return;
		}

		const delay = this.options.reconnectDelay * Math.pow( 2, this.reconnectAttempts );
		this.reconnectAttempts++;

		console.log(
			`[YJS-Pinghub] Scheduling reconnect attempt ${ this.reconnectAttempts } in ${ delay }ms`
		);

		this.reconnectTimer = setTimeout( () => {
			this.reconnectTimer = null;
			this.connect();
		}, delay );
	}

	/**
	 * Clean disconnect
	 */
	disconnect() {
		if ( this.reconnectTimer ) {
			clearTimeout( this.reconnectTimer );
			this.reconnectTimer = null;
		}

		if ( this.ws ) {
			this.ws.close( 1000, 'User disconnected' );
		}

		// Clean up YJS listeners
		this.doc.off( 'update', this.handleYjsUpdate );
		this.awareness.off( 'update', this.handleAwarenessUpdate );

		// Clear awareness
		this.awareness.destroy();
	}

	/**
	 * Simple event emitter for external listeners
	 * @param {string} event
	 * @param {...any} args
	 */
	emit( event, ...args ) {
		if ( this.options[ `on${ event }` ] ) {
			this.options[ `on${ event }` ]( ...args );
		}
	}
}

/**
 * Convenience function to create a collaborative YJS document with Pinghub
 * @param {string} siteId - WordPress site ID
 * @param {string} docId - Document identifier (post ID, page ID, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} { doc, awareness, adapter }
 */
export function createCollaborativeDocument( siteId, docId, options = {} ) {
	const doc = new Y.Doc();
	const channel = `/rtc/site-${ siteId }/doc-${ docId }`;

	const adapter = new YjsPinghubAdapter( channel, doc, options );

	return {
		doc,
		awareness: adapter.awareness,
		adapter,
		disconnect: () => adapter.disconnect(),
	};
}

/**
 * Example usage:
 *
 * import { createCollaborativeDocument } from './yjs-pinghub-adapter.js';
 *
 * // Create a collaborative document
 * const { doc, awareness, adapter } = createCollaborativeDocument('123', '456', {
 *     userName: 'John Doe',
 *     userColor: '#ff6b6b',
 *     onconnected: () => console.log('Connected to collaboration!'),
 *     ondisconnected: () => console.log('Disconnected from collaboration'),
 *     onerror: (error) => console.error('Collaboration error:', error)
 * });
 *
 * // Use YJS normally
 * const text = doc.getText('content');
 * text.insert(0, 'Hello collaborative world!');
 *
 * // Clean up when done
 * adapter.disconnect();
 */
