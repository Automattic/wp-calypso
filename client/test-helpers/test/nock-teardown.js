/**
 * A request a test leaves in flight must be refused by nock, not passed through to the
 * network when `@automattic/calypso-jest` disposes the interceptors in `afterAll`. A leaked
 * socket outlives the file and can fail whichever suite the worker runs next, e.g. with
 * `read EINVAL`.
 */
const https = require( 'node:https' );
const tls = require( 'node:tls' );

// Long enough for a passed-through request to open its connection.
const DISPATCH_WAIT_MS = 100;

const originalConnect = tls.connect;
const connectedHosts = [];
let requestError;

beforeAll( () => {
	tls.connect = ( options ) => {
		connectedHosts.push( options.host );
		throw new Error( `Real network connection to ${ options.host }` );
	};
} );

// Runs after the interceptors are disposed: the preset registers its `afterAll` first.
afterAll( async () => {
	await new Promise( ( resolve ) => setTimeout( resolve, DISPATCH_WAIT_MS ) );
	tls.connect = originalConnect;

	// eslint-disable-next-line jest/no-standalone-expect -- the outcome is only visible after teardown.
	expect( connectedHosts ).toEqual( [] );
	// eslint-disable-next-line jest/no-standalone-expect
	expect( requestError?.name ).toBe( 'NetConnectNotAllowedError' );
} );

// eslint-disable-next-line jest/expect-expect -- asserted in `afterAll`.
test( 'leaves a request in flight', () => {
	https.get( 'https://public-api.wordpress.com/rest/v1.1/me' ).on( 'error', ( error ) => {
		requestError = error;
	} );
} );
