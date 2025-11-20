/**
 * Test Token Generator for RTC WebSocket Server
 *
 * This utility generates JWT tokens for testing the RTC WebSocket server.
 * Usage: node test-token-generator.js [room_name] [user_id] [username]
 */

import jwt from 'jsonwebtoken';

// Use the same dummy secret as the server
const JWT_SECRET = process.env.RTC_WEBSOCKET_SECRET || 'dummy-dev-secret-replace-in-production';

/**
 * Generates a test JWT token for WebSocket authentication
 * @param {string} roomName - The room/document name
 * @param {number} userId - User ID
 * @param {string} username - Username
 * @returns {string} JWT token
 */
function generateTestToken( roomName = 'test-document', userId = 1, username = 'testuser' ) {
	const payload = {
		user_id: userId,
		username: username,
		room_name: roomName,
		connection_id: `conn_${ Date.now() }_${ Math.random().toString( 36 ).substr( 2, 9 ) }`,
		iat: Math.floor( Date.now() / 1000 ),
		exp: Math.floor( Date.now() / 1000 ) + 4 * 60 * 60, // 4 hours
	};

	const token = jwt.sign( payload, JWT_SECRET );
	return token;
}

/**
 * Main function for CLI usage
 */
function main() {
	const args = process.argv.slice( 2 );
	const roomName = args[ 0 ] || 'test-document';
	const userId = parseInt( args[ 1 ] ) || 1;
	const username = args[ 2 ] || 'testuser';

	const token = generateTestToken( roomName, userId, username );

	console.log( 'Generated JWT token for WebSocket testing:' );
	console.log( '' );
	console.log( 'Room Name:', roomName );
	console.log( 'User ID:', userId );
	console.log( 'Username:', username );
	console.log( '' );
	console.log( 'Token:' );
	console.log( token );
	console.log( '' );
	console.log( 'WebSocket URL example:' );
	console.log( `ws://localhost:3001/${ roomName }?auth=${ token }` );
	console.log( '' );
	console.log( 'Test with wscat:' );
	console.log( `wscat -c "ws://localhost:3001/${ roomName }?auth=${ token }"` );
}

// Run main function if this script is executed directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
	main();
}

export { generateTestToken };
