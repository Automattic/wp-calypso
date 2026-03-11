type BridgeEventMap = {
	open: () => void;
	close: ( code: number, reason: string ) => void;
	message: ( data: Uint8Array ) => void;
};

/** Body of a PingHub proxy response (open, close, message, or error). */
type ProxyResponseBody = {
	type: 'open' | 'close' | 'message' | 'error';
	code?: number;
	reason?: string;
	text?: string;
	data?: ArrayBuffer | Blob | string;
};

/** Normalized proxy response we can handle in one place. */
type NormalizedProxyResponse = {
	body: ProxyResponseBody;
	code: number;
	callback: string;
};

const IFRAME_SRC_BASE = 'https://public-api.wordpress.com/wp-admin/rest-proxy/';
const PROXY_ORIGIN = 'https://public-api.wordpress.com';
const PROXY_ALREADY_SUBSCRIBED = 444;
const PROXY_READY_TIMEOUT_MS = 30 * 1000;

const CHUNK_MAGIC = 0xfe;
const CHUNK_HEADER_LEN = 5; // magic(1) + msgId(2) + totalChunks(1) + chunkIndex(1)
const MAX_PAYLOAD_BEFORE_CHUNK = 256;
const MAX_CHUNK_BUFFERS = 64;

/**
 * Encode a Uint8Array into a base64 string for text-frame transport.
 *
 * @param u8 - Bytes to encode.
 * @returns Base64-encoded string.
 */
function uint8ArrayToBase64( u8: Uint8Array ): string {
	let binary = '';
	for ( let i = 0; i < u8.length; i++ ) {
		binary += String.fromCharCode( u8[ i ] );
	}
	return btoa( binary );
}

/**
 * Decode a base64 string back into a Uint8Array.
 *
 * @param base64 - Base64-encoded string.
 * @returns Decoded bytes.
 */
function base64ToUint8Array( base64: string ): Uint8Array {
	const binary = atob( base64 );
	const u8 = new Uint8Array( binary.length );
	for ( let i = 0; i < binary.length; i++ ) {
		u8[ i ] = binary.charCodeAt( i );
	}
	return u8;
}

/**
 * Build a single chunk buffer: [CHUNK_MAGIC, msgIdHi, msgIdLo, totalChunks, chunkIndex, ...payload].
 *
 * @param msgId       - Message identifier (per path).
 * @param totalChunks - Total chunks for this message.
 * @param chunkIndex  - Zero-based index of this chunk.
 * @param payload     - Slice of the original payload for this chunk.
 * @returns Encoded chunk including header and payload.
 */
function buildChunk(
	msgId: number,
	totalChunks: number,
	chunkIndex: number,
	payload: Uint8Array
): Uint8Array {
	const out = new Uint8Array( CHUNK_HEADER_LEN + payload.length );
	out[ 0 ] = CHUNK_MAGIC;
	out[ 1 ] = ( msgId >> 8 ) & 0xff; // eslint-disable-line no-bitwise
	out[ 2 ] = msgId & 0xff; // eslint-disable-line no-bitwise
	out[ 3 ] = totalChunks;
	out[ 4 ] = chunkIndex;
	out.set( payload, CHUNK_HEADER_LEN );
	return out;
}

/**
 * Parse chunk header. Returns null if not a chunk or invalid.
 *
 * @param data - Candidate frame bytes.
 * @returns Parsed header and payload, or null if not a chunk.
 */
function parseChunkHeader( data: Uint8Array ): {
	msgId: number;
	totalChunks: number;
	chunkIndex: number;
	payload: Uint8Array;
} | null {
	if ( data.length < CHUNK_HEADER_LEN || data[ 0 ] !== CHUNK_MAGIC ) {
		return null;
	}
	return {
		msgId: data[ 1 ] * 256 + data[ 2 ],
		totalChunks: data[ 3 ],
		chunkIndex: data[ 4 ],
		payload: data.subarray( CHUNK_HEADER_LEN ),
	};
}

/**
 * Convert a string to bytes by taking the low byte of each char code.
 *
 * @param str - The string to convert.
 * @returns Byte array.
 */
function textToBytes( str: string ): Uint8Array {
	const u8 = new Uint8Array( str.length );
	for ( let i = 0; i < str.length; i++ ) {
		// eslint-disable-next-line no-bitwise
		u8[ i ] = str.charCodeAt( i ) & 0xff;
	}
	return u8;
}

/**
 * Parse event.data (string or already an object) into a plain value.
 *
 * @param data - The postMessage data (possibly a JSON string).
 * @returns Parsed value or null.
 */
function parseRaw( data: unknown ): unknown {
	if ( typeof data === 'string' ) {
		try {
			return JSON.parse( data );
		} catch {
			return null;
		}
	}
	return data;
}

/**
 * Try to parse the array format: [ body, code, headers?, callback ] or [ code, body, headers?, callback ].
 *
 * @param raw - The array payload from the proxy.
 * @returns Normalized response or null if not a valid array response.
 */
function parseArrayResponse( raw: unknown[] ): NormalizedProxyResponse | null {
	if ( raw.length < 3 ) {
		return null;
	}

	const callbackRaw = raw[ raw.length - 1 ];
	const callback = callbackRaw != null ? String( callbackRaw ) : '';
	if ( ! callback ) {
		return null;
	}

	let code: number;
	let bodyObj: unknown;
	const first = raw[ 0 ];
	const second = raw[ 1 ];
	const firstIsCode =
		typeof first === 'number' ||
		( typeof first === 'string' && first !== '' && ! Number.isNaN( Number( first ) ) );

	// Order A: [ body, code, headers?, callback ]
	if ( typeof first === 'object' && first !== null ) {
		bodyObj = first;
		code = Number( raw[ raw.length - 2 ] );
	}
	// Order B: [ code, body, headers?, callback ] (code may be number or string from JSON)
	else if ( firstIsCode && typeof second === 'object' && second !== null ) {
		bodyObj = second;
		code = Number( first );
	} else {
		return null;
	}

	// Inner body may be at .body or the object itself (e.g. { type: 'open' } or { body: { type, ... } })
	const body =
		( bodyObj as { body?: ProxyResponseBody } ).body ??
		( ( bodyObj as { type?: string } ).type !== undefined ? bodyObj : null );
	if (
		typeof body !== 'object' ||
		! body ||
		typeof ( body as ProxyResponseBody ).type !== 'string'
	) {
		return null;
	}
	return { body: body as ProxyResponseBody, code, callback };
}

/**
 * Try to parse the legacy object format: { callback, body: { type, ... }, code? }.
 *
 * @param raw - The object payload from the proxy.
 * @returns Normalized response or null if not a valid legacy response.
 */
function parseLegacyObjectResponse(
	raw: Record< string, unknown >
): NormalizedProxyResponse | null {
	const o = raw as { callback?: string; body?: ProxyResponseBody; code?: number };
	if ( typeof o.callback !== 'string' || ! o.body || typeof o.body !== 'object' ) {
		return null;
	}
	return {
		body: o.body as ProxyResponseBody,
		code: typeof o.code === 'number' ? o.code : 0,
		callback: o.callback,
	};
}

/**
 * Normalize proxy response (array or legacy object) into a single shape.
 *
 * Proxy sends either an array `[ body, code, headers?, callback ]` (supports_args)
 * or a legacy object with `.callback` and `.body`.
 *
 * @param raw - The parsed postMessage payload.
 * @returns Normalized response or null if not a valid proxy response.
 */
function normalizeProxyResponse( raw: unknown ): NormalizedProxyResponse | null {
	if ( ! raw || typeof raw !== 'object' ) {
		return null;
	}

	if ( Array.isArray( raw ) ) {
		return parseArrayResponse( raw );
	}

	return parseLegacyObjectResponse( raw as Record< string, unknown > );
}

/**
 * Get the blog ID from the WordPress globals.
 *
 * @returns The blog ID or null if it cannot be determined.
 */
function getBlogId(): number | null {
	if ( typeof window._currentSiteId === 'number' ) {
		return window._currentSiteId;
	}
	if ( typeof window.wpcomGutenberg?.blogId === 'number' ) {
		return window.wpcomGutenberg.blogId;
	}
	if ( typeof window.currentBlogId === 'number' ) {
		return window.currentBlogId;
	}
	return null;
}

export class PingHubBridge {
	private iframe: HTMLIFrameElement;
	private ready = false;
	private readyResolvers: Array< () => void > = [];
	private openHandlers = new Map< string, Set< () => void > >();
	private closeHandlers = new Map< string, Set< ( code: number, reason: string ) => void > >();
	private messageHandlers = new Map< string, Set< ( data: Uint8Array ) => void > >();
	private callbackSeq = 1;
	private pending = new Map< string, () => void >();
	private callbackToPath = new Map< string, string >();
	private pathToCallback = new Map< string, string >();
	/** Paths that have received 'open' and not yet 'close' or disconnect – one socket per path. */
	private connectedPaths = new Set< string >();
	/** Paths with a connect request in flight; waiters are resolved when we get open or error. */
	private connectingPathWaiters = new Map<
		string,
		Array< { resolve: () => void; reject: ( err: Error ) => void } >
	>();
	/** Per-path message id for chunked sends. */
	private chunkMsgIdByPath = new Map< string, number >();
	/** Reassembly buffer: key = path + ':' + msgId, value = { totalChunks, chunks } */
	private chunkBuffers = new Map<
		string,
		{ totalChunks: number; chunks: Map< number, Uint8Array > }
	>();

	/** Reuse an existing proxy iframe or create a new one and start listening for messages. */
	constructor() {
		const existing = document.querySelector(
			`iframe[src^="${ IFRAME_SRC_BASE }"]`
		) as HTMLIFrameElement | null;
		this.iframe = existing ?? this.createIframe();
		window.addEventListener( 'message', this.handleMessage );
	}

	/**
	 * Build the full PingHub path for a room name.
	 *
	 * @param room - Short room identifier (e.g. "postType-post-42").
	 * @returns Full PingHub channel path.
	 */
	private fullPath( room: string ): string {
		const blogId = getBlogId();
		if ( ! blogId ) {
			throw new Error( 'Cannot determine blog ID for PingHub bridge' );
		}

		return `/pinghub/wpcom/rtc/${ blogId }/${ room }`;
	}

	/**
	 * Create and append a hidden proxy iframe to the document body.
	 *
	 * @returns The created iframe element.
	 */
	private createIframe(): HTMLIFrameElement {
		const iframe = document.createElement( 'iframe' );
		iframe.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
		iframe.src = `${ IFRAME_SRC_BASE }?v=2.0#${ window.location.origin }`;
		document.body.appendChild( iframe );
		return iframe;
	}

	/**
	 * Post a structured message to the proxy iframe.
	 *
	 * @param msg - The message to send.
	 */
	private postToProxy( msg: Record< string, unknown > ): void {
		this.iframe.contentWindow?.postMessage( msg, PROXY_ORIGIN );
	}

	/**
	 * Return a promise that resolves once the proxy iframe signals readiness.
	 *
	 * @returns Resolves when the proxy is ready.
	 */
	private waitReady(): Promise< void > {
		if ( this.ready ) {
			return Promise.resolve();
		}
		return new Promise( ( resolve, reject ) => {
			this.readyResolvers.push( resolve );
			setTimeout( () => {
				if ( ! this.ready ) {
					reject( new Error( 'PingHub proxy iframe did not become ready in time' ) );
				}
			}, PROXY_READY_TIMEOUT_MS );
		} );
	}

	/**
	 * Handle incoming postMessage events from the proxy iframe.
	 *
	 * @param event - The MessageEvent from the proxy.
	 */
	private handleMessage = ( event: MessageEvent ): void => {
		if ( event.origin !== PROXY_ORIGIN ) {
			return;
		}

		const data = event.data;

		// 1) Ready / cookie-auth
		if (
			data === 'ready' ||
			( data?.type === 'pinghub-proxy' && data?.body?.type === 'cookie-auth' )
		) {
			this.ready = true;
			this.readyResolvers.splice( 0 ).forEach( ( r ) => r() );
			return;
		}

		// 2) Proxy JSON response (array or object)
		const raw = parseRaw( data );
		const response = normalizeProxyResponse( raw );
		if ( response ) {
			this.handleProxyResponse( response );
		}
	};

	/**
	 * Resolve or reject all connect waiters for a path.
	 *
	 * @param path    - The PingHub path.
	 * @param success - Whether the connect succeeded.
	 */
	private settleConnectWaiters( path: string | undefined, success: boolean ): void {
		const waiters = path ? this.connectingPathWaiters.get( path ) : undefined;
		if ( waiters ) {
			const err = new Error( 'PingHub connect failed' );
			waiters.forEach( ( w ) => ( success ? w.resolve() : w.reject( err ) ) );
			this.connectingPathWaiters.delete( path! );
		}
	}

	/**
	 * Route a normalized proxy response to the appropriate handler by message type.
	 *
	 * @param res - The normalized proxy response.
	 */
	private handleProxyResponse( res: NormalizedProxyResponse ): void {
		const { body, code, callback } = res;
		const path = this.callbackToPath.get( callback );
		const resolvePending = this.pending.get( callback );
		if ( resolvePending ) {
			this.pending.delete( callback );
		}

		switch ( body.type ) {
			case 'open':
				if ( path ) {
					this.connectedPaths.add( path );
					this.openHandlers.get( path )?.forEach( ( h ) => h() );
				}
				this.settleConnectWaiters( path, true );
				break;
			case 'close':
				if ( path ) {
					this.connectedPaths.delete( path );
					this.closeHandlers
						.get( path )
						?.forEach( ( h ) => h( body.code ?? 1000, body.reason ?? '' ) );
				}
				if ( resolvePending ) {
					resolvePending();
				}
				break;
			case 'message':
				if ( path && body.data !== undefined ) {
					this.dispatchToHandlers( path, body.data );
				}
				break;
			case 'error':
				// Proxy returns 444 "already subscribed" when we connect the same path twice – treat as success.
				if ( path && ( code === PROXY_ALREADY_SUBSCRIBED || body.text === 'already subscribed' ) ) {
					this.connectedPaths.add( path );
					this.openHandlers.get( path )?.forEach( ( h ) => h() );
					this.settleConnectWaiters( path, true );
				} else {
					if ( path ) {
						this.callbackToPath.delete( callback );
						this.pathToCallback.delete( path );
					}
					this.settleConnectWaiters( path, false );
					if ( resolvePending ) {
						resolvePending();
					}
				}
				break;
			default:
				if ( resolvePending ) {
					resolvePending();
				}
		}
	}

	/**
	 * Dispatches received data to path handlers.
	 *
	 * Incoming frames may be:
	 * - Base64 string (text frame): decoded to Uint8Array, then treated as chunk or whole message.
	 * - Chunk (first byte CHUNK_MAGIC): buffered by path+msgId; when all chunks received, reassembled in order (chunk 0, 1, …) and passed once to handlers. Non-chunk messages are passed through.
	 *
	 * @param path - PingHub path for the message.
	 * @param data - Raw payload from the proxy.
	 */
	private dispatchToHandlers( path: string, data: ArrayBuffer | Blob | string ): void {
		const handlers = this.messageHandlers.get( path );
		if ( ! handlers?.size ) {
			return;
		}

		const run = ( u8: Uint8Array ) => {
			const parsed = parseChunkHeader( u8 );
			if ( parsed ) {
				this.reassembleChunk( path, parsed, handlers );
				return;
			}
			handlers.forEach( ( h ) => h( u8 ) );
		};
		if ( typeof data === 'string' ) {
			try {
				run( base64ToUint8Array( data ) );
			} catch {
				// Fallback: treat as raw bytes (e.g. proxy sent non-base64 text)
				run( textToBytes( data ) );
			}
		} else if ( data instanceof ArrayBuffer ) {
			run( new Uint8Array( data ) );
		} else if ( data instanceof Blob ) {
			data.arrayBuffer().then( ( ab ) => run( new Uint8Array( ab ) ) );
		}
	}

	/**
	 * Buffer incoming chunks and dispatch the reassembled message when all chunks have arrived.
	 *
	 * @param path               - PingHub path for the message.
	 * @param parsed             - Parsed chunk header and payload.
	 * @param parsed.msgId       - Message identifier shared across all chunks of one message.
	 * @param parsed.totalChunks - Total number of chunks expected.
	 * @param parsed.chunkIndex  - Zero-based index of this chunk.
	 * @param parsed.payload     - Payload bytes for this chunk.
	 * @param handlers           - Set of handlers to invoke with the reassembled message.
	 */
	private reassembleChunk(
		path: string,
		parsed: { msgId: number; totalChunks: number; chunkIndex: number; payload: Uint8Array },
		handlers: Set< ( data: Uint8Array ) => void >
	): void {
		const key = `${ path }:${ parsed.msgId }`;
		let buf = this.chunkBuffers.get( key );
		if ( ! buf ) {
			// Drop oldest incomplete buffers when the cap is reached.
			if ( this.chunkBuffers.size >= MAX_CHUNK_BUFFERS ) {
				const oldest = this.chunkBuffers.keys().next().value;
				if ( oldest !== undefined ) {
					this.chunkBuffers.delete( oldest );
				}
			}
			buf = { totalChunks: parsed.totalChunks, chunks: new Map() };
			this.chunkBuffers.set( key, buf );
		}
		buf.chunks.set( parsed.chunkIndex, parsed.payload );
		if ( buf.chunks.size !== buf.totalChunks ) {
			return;
		}

		this.chunkBuffers.delete( key );
		const parts: Uint8Array[] = [];
		for ( let i = 0; i < buf.totalChunks; i++ ) {
			const chunk = buf.chunks.get( i );
			if ( ! chunk ) {
				// Missing chunk index — discard the incomplete message.
				return;
			}
			parts.push( chunk );
		}
		const totalLen = parts.reduce( ( s, p ) => s + p.length, 0 );
		const reassembled = new Uint8Array( totalLen );
		let offset = 0;
		for ( const p of parts ) {
			reassembled.set( p, offset );
			offset += p.length;
		}
		handlers.forEach( ( h ) => h( reassembled ) );
	}

	/**
	 * Return the handler map for a given event type.
	 *
	 * @param event - The event name.
	 * @returns The corresponding handler map.
	 */
	private handlersFor< E extends keyof BridgeEventMap >(
		event: E
	): Map< string, Set< BridgeEventMap[ E ] > > {
		switch ( event ) {
			case 'open':
				return this.openHandlers as Map< string, Set< BridgeEventMap[ E ] > >;
			case 'close':
				return this.closeHandlers as Map< string, Set< BridgeEventMap[ E ] > >;
			case 'message':
				return this.messageHandlers as Map< string, Set< BridgeEventMap[ E ] > >;
			default:
				throw new Error( `Unknown bridge event: ${ String( event ) }` );
		}
	}

	/**
	 * Register an event handler for a channel path.
	 *
	 * @param path    - PingHub channel path.
	 * @param event   - Event name: 'open', 'close', or 'message'.
	 * @param handler - Callback for the event.
	 */
	on< E extends keyof BridgeEventMap >(
		path: string,
		event: E,
		handler: BridgeEventMap[ E ]
	): void {
		const map = this.handlersFor( event );
		let set = map.get( path );
		if ( ! set ) {
			set = new Set();
			map.set( path, set );
		}
		set.add( handler );
	}

	/**
	 * Remove a previously registered event handler.
	 *
	 * @param path    - PingHub channel path.
	 * @param event   - Event name: 'open', 'close', or 'message'.
	 * @param handler - The handler to remove.
	 */
	off< E extends keyof BridgeEventMap >(
		path: string,
		event: E,
		handler: BridgeEventMap[ E ]
	): void {
		this.handlersFor( event ).get( path )?.delete( handler );
	}

	async connect( room: string ): Promise< void > {
		await this.waitReady();

		// Already connected: no new socket, just notify so handlers run.
		if ( this.connectedPaths.has( room ) ) {
			this.openHandlers.get( room )?.forEach( ( h ) => h() );
			return;
		}

		// Connect already in flight for this room: wait for it instead of sending another.
		const existing = this.connectingPathWaiters.get( room );
		if ( existing ) {
			return new Promise( ( resolve, reject ) => existing.push( { resolve, reject } ) );
		}

		const waiters: Array< { resolve: () => void; reject: ( err: Error ) => void } > = [];
		this.connectingPathWaiters.set( room, waiters );

		const callback = String( this.callbackSeq++ );
		this.callbackToPath.set( callback, room );
		this.pathToCallback.set( room, callback );

		this.postToProxy( {
			type: 'pinghub-proxy',
			action: 'connect',
			path: this.fullPath( room ),
			callback,
			supports_args: true,
			binary: false,
		} );

		return new Promise( ( resolve, reject ) => {
			waiters.push( { resolve, reject } );
		} );
	}

	async disconnect( room: string ): Promise< void > {
		await this.waitReady();
		this.connectedPaths.delete( room );
		const callback = this.pathToCallback.get( room );
		if ( callback ) {
			this.callbackToPath.delete( callback );
			this.pathToCallback.delete( room );
		}
		return new Promise( ( resolve ) => {
			const discCallback = String( this.callbackSeq++ );
			this.pending.set( discCallback, () => resolve() );
			this.postToProxy( {
				type: 'pinghub-proxy',
				action: 'disconnect',
				path: this.fullPath( room ),
				callback: discCallback,
			} );
		} );
	}

	send( room: string, data: Uint8Array ): void {
		if ( ! this.iframe.contentWindow ) {
			return;
		}

		const proxyPath = this.fullPath( room );
		const sendOne = ( payload: Uint8Array ) => {
			this.postToProxy( {
				type: 'pinghub-proxy',
				action: 'send',
				path: proxyPath,
				message: uint8ArrayToBase64( payload ),
			} );
		};

		if ( data.length <= MAX_PAYLOAD_BEFORE_CHUNK ) {
			sendOne( data );
			return;
		}

		const msgId = ( this.chunkMsgIdByPath.get( room ) ?? 0 ) & 0xffff; // eslint-disable-line no-bitwise
		this.chunkMsgIdByPath.set( room, msgId + 1 );
		const chunkSize = MAX_PAYLOAD_BEFORE_CHUNK - CHUNK_HEADER_LEN;
		const totalChunks = Math.ceil( data.length / chunkSize );
		for ( let i = 0; i < totalChunks; i++ ) {
			const start = i * chunkSize;
			const payload = data.subarray( start, Math.min( start + chunkSize, data.length ) );
			const chunk = buildChunk( msgId, totalChunks, i, payload );
			sendOne( chunk );
		}
	}
}
