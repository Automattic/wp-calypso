import { describe, expect, it } from 'vitest';
import {
	AgentRequestError,
	getAgentErrorDetails,
	markTimeoutError,
	validateHttpResponse,
	validateJsonRpcResponse,
} from '../errors';

describe( 'validateHttpResponse', () => {
	const jsonResponse = ( body: unknown, status: number ) =>
		new Response( JSON.stringify( body ), {
			status,
			headers: { 'Content-Type': 'application/json' },
		} );

	it( 'keeps the status on the error, with the message unchanged', async () => {
		await expect( validateHttpResponse( new Response( null, { status: 502 } ) ) ).rejects.toEqual(
			new AgentRequestError( 'HTTP error! status: 502', { status: 502 } )
		);
	} );

	it.each( [
		[ 'WP REST', { code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.' } ],
		[ 'error', { error: { code: 'rest_forbidden', message: 'Forbidden' } } ],
		[ 'data', { data: { code: 'rest_forbidden' } } ],
	] )( 'reads the code from a %s-style body', async ( _style, body ) => {
		await expect( validateHttpResponse( jsonResponse( body, 403 ) ) ).rejects.toMatchObject( {
			message: 'HTTP error! status: 403',
			status: 403,
			code: 'rest_forbidden',
		} );
	} );

	it( 'leaves the body unread', async () => {
		const response = jsonResponse( { code: 'rest_forbidden' }, 403 );

		await expect( validateHttpResponse( response ) ).rejects.toThrow();

		expect( response.bodyUsed ).toBe( false );
	} );

	it( 'keeps only the status when the body isn’t JSON', async () => {
		const error = await validateHttpResponse(
			new Response( '<html>Bad gateway</html>', { status: 502 } )
		).catch( ( caught: unknown ) => caught );

		expect( error ).toMatchObject( { status: 502, code: undefined } );
	} );

	it( 'passes an ok response without reading it', async () => {
		const response = jsonResponse( { code: 'ignored' }, 200 );

		await expect( validateHttpResponse( response ) ).resolves.toBeUndefined();
		expect( response.bodyUsed ).toBe( false );
	} );
} );

describe( 'validateJsonRpcResponse', () => {
	it( 'keeps the server’s named code', () => {
		expect( () =>
			validateJsonRpcResponse( {
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32000, message: 'Refused', data: { code: 'rest_forbidden' } },
			} )
		).toThrow( expect.objectContaining( { code: 'rest_forbidden' } ) );
	} );

	it( 'keeps the numeric code when the server names none', () => {
		expect( () =>
			validateJsonRpcResponse( {
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32603, message: 'Internal error' },
			} )
		).toThrow( expect.objectContaining( { code: -32603 } ) );
	} );
} );

describe( 'markTimeoutError', () => {
	const abortError = () =>
		Object.assign( new Error( 'The operation was aborted.' ), { name: 'AbortError' } );

	const abortedSignal = () => {
		const controller = new AbortController();
		controller.abort();
		return controller.signal;
	};

	it( 'marks the timer’s abort, which stays an AbortError', () => {
		const error = abortError();

		expect( markTimeoutError( error, abortedSignal() ) ).toBe( error );
		expect( error ).toMatchObject( { name: 'AbortError', timedOut: true } );
	} );

	it( 'leaves the caller’s own abort unmarked', () => {
		const error = abortError();

		markTimeoutError( error, abortedSignal(), abortedSignal() );

		expect( error ).not.toHaveProperty( 'timedOut' );
	} );

	it( 'passes an error through while the timer has not fired', () => {
		const error = new TypeError( 'Failed to fetch' );

		expect( markTimeoutError( error, new AbortController().signal ) ).toBe( error );
		expect( error ).not.toHaveProperty( 'timedOut' );
	} );
} );

describe( 'getAgentErrorDetails', () => {
	it( 'reads the name, status and code', () => {
		expect(
			getAgentErrorDetails( new AgentRequestError( 'HTTP error! status: 503', { status: 503 } ) )
		).toEqual( { name: 'AgentRequestError', status: 503 } );
	} );

	it( 'reads a timed-out abort', () => {
		const error = Object.assign( new Error( 'aborted' ), { name: 'AbortError', timedOut: true } );

		expect( getAgentErrorDetails( error ) ).toEqual( { name: 'AbortError', timedOut: true } );
	} );

	it( 'keeps a fetch failure’s name and nothing else', () => {
		expect( getAgentErrorDetails( new TypeError( 'Load failed' ) ) ).toEqual( {
			name: 'TypeError',
		} );
	} );

	it( 'ignores a status or code that is not a number or string', () => {
		const error = Object.assign( new Error( 'odd' ), { status: '503', code: { id: 1 } } );

		expect( getAgentErrorDetails( error ) ).toEqual( { name: 'Error' } );
	} );

	it( 'names a thrown non-error plainly', () => {
		expect( getAgentErrorDetails( 'boom' ) ).toEqual( { name: 'Error' } );
	} );
} );
