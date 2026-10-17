/**
 * @jest-environment node
 */
import debugFactory from 'debug';
import sendRequest, { redactToken } from '../src/lib/util/send-request';

const TOKEN = 'secret-oauth-token-1234567890';

function fakeClient( token ) {
	return {
		token,
		apiVersion: '1.1',
		request: ( params, fn ) => fn( null, { seen: params.token } ),
	};
}

describe( 'redactToken', () => {
	test( 'returns params untouched when there is no token', () => {
		const params = { path: '/me', method: 'GET' };
		expect( redactToken( params ) ).toBe( params );
		expect( redactToken( null ) ).toBe( null );
	} );

	test( 'replaces the token in a copy and leaves the original alone', () => {
		const params = { path: '/me', token: TOKEN };
		const safe = redactToken( params );
		expect( safe ).not.toBe( params );
		expect( safe.token ).toBe( '[redacted]' );
		expect( safe.path ).toBe( '/me' );
		expect( params.token ).toBe( TOKEN );
	} );
} );

describe( 'sendRequest debug output', () => {
	let originalLog;
	let lines;

	beforeEach( () => {
		originalLog = debugFactory.log;
		lines = [];
		debugFactory.log = ( ...args ) => lines.push( args.join( ' ' ) );
		debugFactory.enable( 'wpcom:send-request' );
	} );

	afterEach( () => {
		debugFactory.disable();
		debugFactory.log = originalLog;
	} );

	test( 'still passes the real token to the request handler', async () => {
		const res = await sendRequest.call( fakeClient( TOKEN ), { path: '/me' }, {}, null );
		expect( res.seen ).toBe( TOKEN );
	} );

	test( 'does not print the token', async () => {
		await sendRequest.call( fakeClient( TOKEN ), { path: '/me' }, {}, null );
		const output = lines.join( '\n' );
		expect( output ).toContain( 'params:' );
		expect( output ).toContain( '[redacted]' );
		expect( output ).not.toContain( TOKEN );
	} );
} );
