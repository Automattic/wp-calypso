import { describe, expect, it } from 'vitest';
import {
	AgentRequestError,
	getAgentErrorDetails,
	toTimeoutError,
	validateHttpResponse,
	validateJsonRpcResponse,
} from '../errors';

describe( 'validateHttpResponse', () => {
	it( 'keeps the status on the error, with the message unchanged', () => {
		expect( () => validateHttpResponse( new Response( null, { status: 502 } ) ) ).toThrow(
			expect.objectContaining( { message: 'HTTP error! status: 502', status: 502 } )
		);
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

describe( 'toTimeoutError', () => {
	const abortError = Object.assign( new Error( 'The operation was aborted.' ), {
		name: 'AbortError',
	} );

	const abortedSignal = () => {
		const controller = new AbortController();
		controller.abort();
		return controller.signal;
	};

	it( 'turns the timer’s abort into a TimeoutError', () => {
		expect( toTimeoutError( abortError, abortedSignal() ) ).toMatchObject( {
			name: 'TimeoutError',
		} );
	} );

	it( 'keeps the caller’s own abort an AbortError', () => {
		expect( toTimeoutError( abortError, abortedSignal(), abortedSignal() ) ).toBe( abortError );
	} );

	it( 'passes an error through while the timer has not fired', () => {
		const error = new TypeError( 'Failed to fetch' );

		expect( toTimeoutError( error, new AbortController().signal ) ).toBe( error );
	} );
} );

describe( 'getAgentErrorDetails', () => {
	it( 'reads the name, status and code', () => {
		expect(
			getAgentErrorDetails( new AgentRequestError( 'HTTP error! status: 503', { status: 503 } ) )
		).toEqual( { name: 'AgentRequestError', status: 503 } );
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
