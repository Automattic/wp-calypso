import { describe, expect, it } from 'vitest';
import {
	A2AErrorCodes,
	createClient,
	createRequestId,
	createTaskId,
	createTextMessage,
	extractTextFromMessage,
} from './index';

describe( '@automattic/agenttic-client', () => {
	describe( 'Utility functions', () => {
		it( 'should create unique request IDs', () => {
			const id1 = createRequestId();
			const id2 = createRequestId();

			expect( id1 ).toMatch( /^req-[a-z0-9]{8}$/ );
			expect( id2 ).toMatch( /^req-[a-z0-9]{8}$/ );
			expect( id1 ).not.toBe( id2 );
		} );

		it( 'should create unique task IDs', () => {
			const id1 = createTaskId();
			const id2 = createTaskId();

			expect( id1 ).toMatch( /^task-[a-z0-9]{8}$/ );
			expect( id2 ).toMatch( /^task-[a-z0-9]{8}$/ );
			expect( id1 ).not.toBe( id2 );
		} );

		it( 'should create text messages', () => {
			const message = createTextMessage( 'Hello world' );

			expect( message ).toEqual( {
				role: 'user',
				kind: 'message',
				messageId: expect.any( String ),
				parts: [
					{
						type: 'text',
						text: 'Hello world',
					},
				],
			} );
		} );

		it( 'should extract text from messages', () => {
			const message = createTextMessage( 'Hello world' );
			const text = extractTextFromMessage( message );

			expect( text ).toBe( 'Hello world' );
		} );

		it( 'should handle empty messages', () => {
			const text = extractTextFromMessage( undefined );
			expect( text ).toBe( '' );
		} );
	} );

	describe( 'Client creation', () => {
		it( 'should create a client with minimal config', () => {
			const client = createClient( {
				agentId: 'test-agent',
			} );

			expect( client ).toBeDefined();
			expect( typeof client.sendMessage ).toBe( 'function' );
			expect( typeof client.sendMessageStream ).toBe( 'function' );
		} );

		it( 'should create a client with full config', () => {
			const authProvider = async () => ( {
				Authorization: 'Bearer test',
			} );

			const client = createClient( {
				agentId: 'test-agent',
				agentUrl: 'https://example.com/agent',
				authProvider,
				defaultSessionId: 'test-session',
				timeout: 5000,
			} );

			expect( client ).toBeDefined();
		} );

		it( 'should create a client without dispatcher (defaults to browser dispatcher)', () => {
			const client = createClient( {
				agentId: 'test-agent',
				authProvider: async () => ( { Authorization: 'Bearer test' } ),
			} );

			expect( client ).toBeDefined();
			expect( typeof client.sendMessage ).toBe( 'function' );
			expect( typeof client.sendMessageStream ).toBe( 'function' );
		} );
	} );

	describe( 'Error codes', () => {
		it( 'should export A2A error codes', () => {
			expect( A2AErrorCodes.PARSE_ERROR ).toBe( -32700 );
			expect( A2AErrorCodes.INVALID_REQUEST ).toBe( -32600 );
			expect( A2AErrorCodes.METHOD_NOT_FOUND ).toBe( -32601 );
			expect( A2AErrorCodes.INVALID_PARAMS ).toBe( -32602 );
			expect( A2AErrorCodes.INTERNAL_ERROR ).toBe( -32603 );
			expect( A2AErrorCodes.SERVER_ERROR ).toBe( -32000 );
		} );
	} );
} );
