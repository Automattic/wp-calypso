/**
 * Real-Time Collaboration WebSocket Server
 *
 * This module implements a WebSocket server for real-time collaborative editing
 * based on the VIP RTC implementation. It uses YJS for operational transforms
 * and JWT tokens for authentication.
 */

import http from 'http';
import config from '@automattic/calypso-config';
import { setPersistence, setupWSConnection } from '@y/websocket-server/utils';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { getLogger } from '../lib/logger';

const logger = getLogger();

// Use a dummy shared secret for development - replace with real secret in production
const JWT_SECRET = process.env.RTC_WEBSOCKET_SECRET || 'dummy-dev-secret-replace-in-production';
const WEBSOCKET_PORT = 3001; // Default port, can be overridden
const CONNECTION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in ms

/**
 * Types for TypeScript-style JSDoc
 * @typedef {Object} AuthSuccessResult
 * @property {true} authenticated
 *
 * @typedef {Object} AuthFailureResult
 * @property {false} authenticated
 * @property {'missing_token'|'invalid_token'|'invalid_payload'} reason
 *
 * @typedef {AuthSuccessResult|AuthFailureResult} AuthResult
 *
 * @typedef {Object} SyncTokenPayload
 * @property {number} user_id
 * @property {string} username
 * @property {string} room_name
 * @property {string} connection_id
 * @property {number} iat - issued at
 * @property {number} exp - expires at
 */

/**
 * WebSocket close codes and their meanings
 */
const WEBSOCKET_CLOSE_CODES = new Map( [ [ 4001, 'Connection timed out. Reconnect.' ] ] );

/**
 * Simple in-memory persistence provider that doesn't actually persist.
 * In WP's RTC implementation, yjs doc state is managed on the clients with
 * the server just serving as a stateless data transport.
 */
class NoopPersistenceProvider {
	constructor() {
		this.docs = new Map();
	}

	bindState( docName, ydoc ) {
		// Store in memory but don't persist to disk
		this.docs.set( docName, ydoc );
	}

	writeState( /* docName, ydoc */ ) {
		// Noop - we're not persisting anything
		return Promise.resolve();
	}
}

/**
 * Validates if an object is a valid sync token payload
 * @param {unknown} payload
 * @returns {payload is SyncTokenPayload}
 */
function isSyncTokenPayload( payload ) {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'user_id' in payload &&
		'username' in payload &&
		'room_name' in payload &&
		'connection_id' in payload
	);
}

/**
 * Verifies and decodes JWT token
 * @param {string} token
 * @returns {SyncTokenPayload}
 * @throws {Error} If token is invalid
 */
function verifyToken( token ) {
	const jwtPayload = jwt.verify( token, JWT_SECRET );
	if ( ! isSyncTokenPayload( jwtPayload ) ) {
		throw new Error( 'Invalid JWT payload' );
	}
	return jwtPayload;
}

/**
 * Extracts connection ID from request
 * @param {http.IncomingMessage} request
 * @returns {string|null}
 */
function getConnectionId( request ) {
	const searchParams = new URLSearchParams( request.url?.split( '?' )[ 1 ] || '' );
	const authToken = searchParams.get( 'auth' );
	if ( ! authToken ) {
		return null;
	}

	try {
		const jwtPayload = verifyToken( authToken );
		return jwtPayload.connection_id;
	} catch {
		return null;
	}
}

/**
 * Gets the pathname from a request URL
 * @param {http.IncomingMessage} request
 * @returns {string}
 */
function getRequestPathname( request ) {
	const pathname = request.url?.split( '?' )[ 0 ] || '/';
	// Remove trailing slashes (except for root path)
	return pathname === '/' ? pathname : pathname.replace( /\/+$/, '' );
}

/**
 * Validates that the room_name in the JWT payload matches the request URL
 * @param {http.IncomingMessage} request
 * @param {SyncTokenPayload} jwtPayload
 * @returns {boolean}
 */
function validateTokenPayload( request, jwtPayload ) {
	const { room_name: roomNameFromToken } = jwtPayload;
	const pathname = getRequestPathname( request );
	const roomNameFromUrl = pathname.replace( /^\/(_ws\/)?/, '' );

	const isValid = roomNameFromToken === roomNameFromUrl;
	if ( ! isValid ) {
		logger.warn( 'JWT decoded but payload invalid:', {
			roomNameFromToken,
			roomNameFromUrl,
			pathname,
		} );
		return false;
	}
	return true;
}

/**
 * Authenticates a WebSocket request
 * @param {http.IncomingMessage} request
 * @returns {AuthResult}
 */
function isRequestAuthenticated( request ) {
	const searchParams = new URLSearchParams( request.url?.split( '?' )[ 1 ] || '' );
	const authToken = searchParams.get( 'auth' );

	if ( ! authToken ) {
		return { authenticated: false, reason: 'missing_token' };
	}

	try {
		const jwtPayload = verifyToken( authToken );
		const isValid = validateTokenPayload( request, jwtPayload );
		if ( ! isValid ) {
			return { authenticated: false, reason: 'invalid_payload' };
		}
		return { authenticated: true };
	} catch ( error ) {
		logger.warn( 'Token verification failed:', error.message );
		return { authenticated: false, reason: 'invalid_token' };
	}
}

/**
 * Creates and starts the WebSocket server
 * @returns {Promise<{server: http.Server, wss: WebSocketServer}>}
 */
async function createRTCWebSocketServer() {
	// Initialize YJS persistence provider
	setPersistence( new NoopPersistenceProvider() );

	// Create WebSocket server
	const wss = new WebSocketServer( { noServer: true } );

	// Create HTTP server for WebSocket upgrades and health checks
	const server = http.createServer( ( request, response ) => {
		const pathname = getRequestPathname( request );

		if ( [ '/cache-healthcheck', '/health', '/ready' ].includes( pathname ) ) {
			response.writeHead( 200, { 'Content-Type': 'text/plain' } );
			response.end( 'OK' );
			return;
		}

		response.writeHead( 404, { 'Content-Type': 'text/plain' } );
		response.end( 'Not Found' );
	} );

	// Handle WebSocket connections
	wss.on( 'connection', ( ws, request ) => {
		const connectionStartTime = Date.now();
		const connectionId = getConnectionId( request );

		logger.info( 'WebSocket connection established', { connectionId } );

		// Set up YJS WebSocket connection
		setupWSConnection( ws, request );

		// Set connection timeout
		const timeout = setTimeout( () => {
			logger.info( 'WebSocket connection timeout', { connectionId } );
			ws.close( 4001, WEBSOCKET_CLOSE_CODES.get( 4001 ) );
		}, CONNECTION_TIMEOUT );

		// Handle connection close
		ws.on( 'close', ( code ) => {
			clearTimeout( timeout );
			const duration = Date.now() - connectionStartTime;
			logger.info( 'WebSocket connection closed', {
				connectionId,
				code,
				duration: `${ duration }ms`,
			} );
		} );

		// Handle errors
		ws.on( 'error', ( error ) => {
			logger.error( 'WebSocket error:', error, { connectionId } );
		} );
	} );

	// Handle WebSocket upgrade requests
	server.on( 'upgrade', ( request, socket, head ) => {
		const authResult = isRequestAuthenticated( request );
		if ( ! authResult.authenticated ) {
			logger.warn( 'WebSocket authentication failed', { reason: authResult.reason } );
			socket.write( 'HTTP/1.1 401 Unauthorized\r\n\r\n' );
			socket.destroy();
			return;
		}

		wss.handleUpgrade( request, socket, head, ( ws ) => {
			wss.emit( 'connection', ws, request );
		} );
	} );

	return { server, wss };
}

/**
 * Starts the RTC WebSocket server if the feature is enabled
 * @returns {Promise<void>}
 */
async function startRTCWebSocketServer() {
	if ( ! config.isEnabled( 'rtc-websocket' ) ) {
		logger.info( 'RTC WebSocket server disabled via feature flag' );
		return;
	}

	try {
		const { server } = await createRTCWebSocketServer();

		const port = process.env.RTC_WEBSOCKET_PORT || WEBSOCKET_PORT;
		const host = process.env.RTC_WEBSOCKET_HOST || 'localhost';

		server.listen( port, host, () => {
			logger.info( `RTC WebSocket server running at ws://${ host }:${ port }` );
		} );

		// Handle server errors
		server.on( 'error', ( error ) => {
			logger.error( 'RTC WebSocket server error:', error );
		} );
	} catch ( error ) {
		logger.error( 'Failed to start RTC WebSocket server:', error );
	}
}

export { startRTCWebSocketServer, createRTCWebSocketServer };
