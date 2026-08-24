/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import useAgentTraceIds from '../use-agent-trace-ids';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

const agentConfig = {
	agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
	agentId: 'wp-orchestrator',
	sessionId: 'session-1',
} as UseAgentChatConfig;

const agentUrl = `${ agentConfig.agentUrl }/${ agentConfig.agentId }`;

function createResponse( body: string, contentType: string | null ) {
	return {
		clone: jest.fn( () => ( {
			text: jest.fn().mockResolvedValue( body ),
		} ) ),
		headers: {
			get: jest.fn( ( header: string ) =>
				header.toLowerCase() === 'content-type' ? contentType : null
			),
		},
	} as unknown as Response;
}

function createTraceEvent( messageId: string, traceId: string ) {
	return {
		result: {
			traceId,
			status: {
				message: {
					messageId,
				},
			},
		},
	};
}

describe( 'useAgentTraceIds', () => {
	let originalFetch: typeof window.fetch;

	beforeEach( () => {
		originalFetch = window.fetch;
	} );

	afterEach( () => {
		window.fetch = originalFetch;
		jest.clearAllMocks();
	} );

	async function fetchAndFlush( input: RequestInfo | URL ): Promise< Response > {
		let response: Response | undefined;
		await act( async () => {
			response = await window.fetch( input );
			await Promise.resolve();
		} );
		return response!;
	}

	it( 'captures a trace ID from an agent JSON response', async () => {
		const response = createResponse(
			JSON.stringify( createTraceEvent( 'message-json', 'trace-json' ) ),
			'application/json'
		);
		const fetchSpy = jest.fn().mockResolvedValue( response );
		window.fetch = fetchSpy as unknown as typeof window.fetch;

		const { result } = renderHook( () => useAgentTraceIds( agentConfig ) );

		await expect( fetchAndFlush( agentUrl ) ).resolves.toBe( response );

		await waitFor( () => expect( result.current( 'message-json' ) ).toBe( 'trace-json' ) );
		expect( fetchSpy ).toHaveBeenCalledWith( agentUrl, undefined );
	} );

	it( 'captures trace IDs from agent SSE responses', async () => {
		const response = createResponse(
			[
				'event: message',
				`data: ${ JSON.stringify( createTraceEvent( 'message-sse-1', 'trace-sse-1' ) ) }`,
				'',
				`data: ${ JSON.stringify( createTraceEvent( 'message-sse-2', 'trace-sse-2' ) ) }`,
				'',
			].join( '\n' ),
			'text/event-stream; charset=utf-8'
		);
		window.fetch = jest.fn().mockResolvedValue( response ) as unknown as typeof window.fetch;

		const { result } = renderHook( () => useAgentTraceIds( agentConfig ) );

		await fetchAndFlush( agentUrl );

		await waitFor( () => {
			expect( result.current( 'message-sse-1' ) ).toBe( 'trace-sse-1' );
			expect( result.current( 'message-sse-2' ) ).toBe( 'trace-sse-2' );
		} );
	} );

	it( 'ignores responses for other URLs', async () => {
		const response = createResponse(
			JSON.stringify( createTraceEvent( 'message-other', 'trace-other' ) ),
			'application/json'
		);
		window.fetch = jest.fn().mockResolvedValue( response ) as unknown as typeof window.fetch;

		const { result } = renderHook( () => useAgentTraceIds( agentConfig ) );

		await fetchAndFlush( `${ agentConfig.agentUrl }/other-agent` );

		expect( response.clone ).not.toHaveBeenCalled();
		expect( result.current( 'message-other' ) ).toBeUndefined();
	} );

	it( 'supports Request-like objects when matching agent URLs', async () => {
		const response = createResponse(
			JSON.stringify( createTraceEvent( 'message-request', 'trace-request' ) ),
			'application/json'
		);
		window.fetch = jest.fn().mockResolvedValue( response ) as unknown as typeof window.fetch;

		const { result } = renderHook( () => useAgentTraceIds( agentConfig ) );

		await fetchAndFlush( { url: agentUrl } as Request );

		await waitFor( () => expect( result.current( 'message-request' ) ).toBe( 'trace-request' ) );
	} );

	it( 'restores calls to the previous fetch implementation on unmount', async () => {
		const response = createResponse( '{}', 'application/json' );
		const fetchSpy = jest.fn().mockResolvedValue( response );
		window.fetch = fetchSpy as unknown as typeof window.fetch;

		const { unmount } = renderHook( () => useAgentTraceIds( agentConfig ) );
		const wrappedFetch = window.fetch;

		unmount();

		expect( window.fetch ).not.toBe( wrappedFetch );
		await window.fetch( 'https://example.com' );
		expect( fetchSpy ).toHaveBeenCalledWith( 'https://example.com' );
	} );
} );
