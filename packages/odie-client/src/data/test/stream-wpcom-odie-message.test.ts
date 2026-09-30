import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { requestOdieStreamToken, streamWpcomOdieMessage } from '../stream-wpcom-odie-message';

jest.mock( '@wordpress/api-fetch' );
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn(),
} ) );

const encoder = new TextEncoder();

const eventStreamResponse = ( chunks: string[] ) => {
	const pending = [ ...chunks ];

	return {
		ok: true,
		status: 200,
		headers: new Headers( { 'Content-Type': 'text/event-stream; charset=utf-8' } ),
		body: {
			getReader: () => ( {
				read: async () =>
					pending.length
						? { done: false, value: encoder.encode( pending.shift() ) }
						: { done: true, value: undefined },
			} ),
		},
	} as unknown as Response;
};

const jsonResponse = ( status: number, data: unknown ) =>
	( {
		ok: status < 400,
		status,
		statusText: 'Status text',
		headers: new Headers( { 'Content-Type': 'application/json' } ),
		body: {},
		json: jest.fn().mockResolvedValue( data ),
	} ) as unknown as Response;

describe( 'streamWpcomOdieMessage', () => {
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		globalThis.fetch = jest.fn();
	} );

	afterAll( () => {
		globalThis.fetch = originalFetch;
	} );

	it( 'posts the message with the token and the stream flag, without cookies', async () => {
		const fetchMock = jest
			.mocked( globalThis.fetch )
			.mockResolvedValue( eventStreamResponse( [ 'event: complete\ndata: {"chat_id":1}\n\n' ] ) );

		await streamWpcomOdieMessage( '/odie/chat/bot/1', {
			body: { message: 'Hello' },
			token: 'jwt',
			onDelta: jest.fn(),
		} );

		expect( fetchMock ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/odie/chat/bot/1',
			{
				body: JSON.stringify( { message: 'Hello', stream: true } ),
				credentials: 'omit',
				headers: { Authorization: 'Bearer jwt', 'Content-Type': 'application/json' },
				method: 'POST',
				signal: undefined,
			}
		);
	} );

	it( 'passes on each chunk of text and resolves with the completed chat', async () => {
		jest
			.mocked( globalThis.fetch )
			.mockResolvedValue(
				eventStreamResponse( [
					'event: chat\ndata: {"chat_id":1,"session_id":"s"}\n\nevent: delta\ndata: {"content":"Hel"}\n',
					'\nevent: delta\ndata: {"content":"lo"}\n\nevent: comp',
					'lete\ndata: {"chat_id":1,"messages":[{"content":"Hello"}]}\n\n',
				] )
			);
		const onDelta = jest.fn();

		const chat = await streamWpcomOdieMessage( '/odie/chat/bot/1', {
			body: { message: 'Hi' },
			token: 'jwt',
			onDelta,
		} );

		expect( onDelta.mock.calls ).toEqual( [ [ 'Hel' ], [ 'lo' ] ] );
		expect( chat ).toEqual( { chat_id: 1, messages: [ { content: 'Hello' } ] } );
	} );

	it( 'throws the status and message of an error event', async () => {
		jest
			.mocked( globalThis.fetch )
			.mockResolvedValue(
				eventStreamResponse( [
					'event: error\ndata: {"code":"process_user_message_error","message":"model unavailable","data":{"status":500,"chat_id":1}}\n\n',
				] )
			);

		await expect(
			streamWpcomOdieMessage( '/odie/chat/bot/1', { body: {}, token: 'jwt', onDelta: jest.fn() } )
		).rejects.toThrow( '500 model unavailable' );
	} );

	it( 'throws when the stream ends without completing', async () => {
		jest
			.mocked( globalThis.fetch )
			.mockResolvedValue( eventStreamResponse( [ 'event: delta\ndata: {"content":"Hel"}\n\n' ] ) );

		await expect(
			streamWpcomOdieMessage( '/odie/chat/bot/1', { body: {}, token: 'jwt', onDelta: jest.fn() } )
		).rejects.toThrow( 'The reply stream ended before the reply was complete.' );
	} );

	it( 'throws the status of a request refused with JSON, so rate limits are recognised', async () => {
		jest
			.mocked( globalThis.fetch )
			.mockResolvedValue( jsonResponse( 429, { message: 'Request limit exceeded.' } ) );

		await expect(
			streamWpcomOdieMessage( '/odie/chat/bot/1', { body: {}, token: 'jwt', onDelta: jest.fn() } )
		).rejects.toThrow( '429 Request limit exceeded.' );
	} );

	it( 'resolves with a JSON reply from a bot that does not stream', async () => {
		jest.mocked( globalThis.fetch ).mockResolvedValue( jsonResponse( 200, { chat_id: 1 } ) );

		await expect(
			streamWpcomOdieMessage( '/odie/chat/bot/1', { body: {}, token: 'jwt', onDelta: jest.fn() } )
		).resolves.toEqual( { chat_id: 1 } );
	} );
} );

describe( 'requestOdieStreamToken', () => {
	it( 'requests the token from WordPress.com where its APIs are reachable', async () => {
		jest.mocked( canAccessWpcomApis ).mockReturnValue( true );
		jest.mocked( wpcomRequest ).mockResolvedValue( { token: 'wpcom-jwt' } );

		await expect( requestOdieStreamToken() ).resolves.toBe( 'wpcom-jwt' );
		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/ai/jwt',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} );
	} );

	it( 'requests the token from the Jetpack connection elsewhere', async () => {
		jest.mocked( canAccessWpcomApis ).mockReturnValue( false );
		jest.mocked( apiFetch ).mockResolvedValue( { token: 'jetpack-jwt' } );

		await expect( requestOdieStreamToken() ).resolves.toBe( 'jetpack-jwt' );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/jetpack/v4/jetpack-ai-jwt',
			method: 'POST',
		} );
	} );

	it( 'returns null when no token can be obtained, so the caller falls back', async () => {
		jest.mocked( canAccessWpcomApis ).mockReturnValue( true );
		jest.mocked( wpcomRequest ).mockRejectedValue( new Error( 'Forbidden' ) );

		await expect( requestOdieStreamToken() ).resolves.toBeNull();
	} );
} );
