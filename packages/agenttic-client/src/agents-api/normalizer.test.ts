import { describe, expect, it, vi } from 'vitest';
import {
	groupToolMessages,
	normalizeAgentsApiMessage,
	normalizeLoadedSession,
	normalizeRunEvent,
	normalizeSendResponse,
	normalizeSessions,
	normalizeSources,
	renderToolGroups,
} from './normalizer';

describe( 'Agents API normalizers', () => {
	it( 'normalizes assistant messages to Agenttic agent messages', () => {
		const message = normalizeAgentsApiMessage( {
			id: 'msg-1',
			role: 'assistant',
			content: 'Hello **there**',
			created_at: '2026-06-06T00:00:00.000Z',
			metadata: { source: 'fixture' },
		} );

		expect( message ).toMatchObject( {
			id: 'msg-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Hello **there**' } ],
			showIcon: true,
			metadata: { source: 'fixture' },
		} );
		expect( message.timestamp ).toBe(
			Date.parse( '2026-06-06T00:00:00.000Z' )
		);
	} );

	it( 'preserves structured content arrays', () => {
		const content = [
			{ type: 'text' as const, text: 'visible' },
			{ type: 'data' as const, data: { citations: [] } },
		];

		const message = normalizeAgentsApiMessage( { role: 'user', content } );

		expect( message.role ).toBe( 'user' );
		expect( message.showIcon ).toBe( false );
		expect( message.content ).toBe( content );
	} );

	it( 'falls back to user and agent messages when send responses omit a conversation', () => {
		const response = normalizeSendResponse(
			{
				data: {
					session_id: 'session-1',
					run_id: 'run-1',
					response: 'Fixture reply',
					metadata: { run_id: 'run-1' },
				},
			},
			'Hello',
			[ { media_id: 123, filename: 'image.png' } ]
		);

		expect( response.sessionId ).toBe( 'session-1' );
		expect( response.runId ).toBe( 'run-1' );
		expect( response.metadata ).toEqual( { run_id: 'run-1' } );
		expect( response.messages ).toHaveLength( 2 );
		expect( response.messages[ 0 ] ).toMatchObject( {
			role: 'user',
			content: [ { type: 'text', text: 'Hello' } ],
			attachments: [ { media_id: 123, filename: 'image.png' } ],
		} );
		expect( response.messages[ 1 ] ).toMatchObject( {
			role: 'agent',
			content: [ { type: 'text', text: 'Fixture reply' } ],
		} );
	} );

	it( 'extracts sources from metadata.sources with field aliases', () => {
		const message = normalizeAgentsApiMessage( {
			id: 'msg-sources',
			role: 'agent',
			content: 'Answer with citations',
			metadata: {
				sources: [
					{
						source_id: 'doc-1',
						name: 'First doc',
						href: 'https://example.com/1',
						provider: 'Wiki',
						metadata: { score: 0.9 },
					},
				],
			},
		} );

		expect( message.sources ).toEqual( [
			{
				id: 'doc-1',
				title: 'First doc',
				url: 'https://example.com/1',
				label: 'Wiki',
				metadata: { score: 0.9 },
			},
		] );
	} );

	it( 'falls back to metadata.citations and treats bare strings as urls', () => {
		const message = normalizeAgentsApiMessage( {
			id: 'msg-citations',
			role: 'agent',
			content: 'Answer',
			metadata: {
				citations: [
					'https://example.com/bare',
					{
						document_id: 'doc-2',
						title: 'Second',
						link: 'https://example.com/2',
					},
					'',
				],
			},
		} );

		expect( message.sources ).toEqual( [
			{ url: 'https://example.com/bare' },
			{ id: 'doc-2', title: 'Second', url: 'https://example.com/2' },
		] );
	} );

	it( 'reads top-level raw.sources and omits sources when none present', () => {
		const withSources = normalizeAgentsApiMessage( {
			id: 'msg-raw',
			role: 'agent',
			content: 'Answer',
			sources: [ { url: 'https://example.com/raw', label: 'Source' } ],
		} );
		expect( withSources.sources ).toEqual( [
			{ url: 'https://example.com/raw', label: 'Source' },
		] );

		const withoutSources = normalizeAgentsApiMessage( {
			id: 'msg-none',
			role: 'agent',
			content: 'Answer',
		} );
		expect( withoutSources.sources ).toBeUndefined();
	} );

	it( 'normalizeSources returns the first non-empty array candidate', () => {
		expect(
			normalizeSources( [], undefined, [ 'https://example.com/x' ] )
		).toEqual( [ { url: 'https://example.com/x' } ] );
		expect( normalizeSources( undefined, null ) ).toEqual( [] );
	} );

	it( 'groups tool messages from generic metadata envelopes', () => {
		const message = normalizeAgentsApiMessage( {
			id: 'tool-result-1',
			role: 'user',
			content: '',
			metadata: {
				type: 'tool_result',
				tool_name: 'present_question',
				tool_call_id: 'call-1',
				tool_data: {
					result: {
						question: 'Pick one',
						choices: [ { label: 'A' }, { label: 'B' } ],
					},
				},
			},
		} );

		expect( groupToolMessages( [ message ] ) ).toEqual( [
			{
				id: 'call-1',
				name: 'present_question',
				result: {
					id: 'call-1',
					message,
					result: {
						question: 'Pick one',
						choices: [ { label: 'A' }, { label: 'B' } ],
					},
				},
			},
		] );
	} );

	it( 'normalizes session envelopes and filters invalid rows', () => {
		expect(
			normalizeSessions( {
				data: {
					sessions: [
						{
							session_id: 'session-1',
							label: 'First session',
							updated_at: '2026-06-06T00:00:00Z',
							unread_count: 2,
						},
						{ label: 'missing id' },
					],
				},
			} )
		).toEqual( [
			{
				id: 'session-1',
				title: 'First session',
				updated_at: '2026-06-06T00:00:00Z',
				updatedAt: '2026-06-06T00:00:00Z',
				created_at: '',
				createdAt: '',
				unread_count: 2,
				metadata: {},
			},
		] );
	} );

	it( 'normalizes loaded sessions and run events', () => {
		expect(
			normalizeLoadedSession( {
				data: {
					session_id: 'session-1',
					conversation: [
						{ id: 'msg-1', role: 'agent', content: 'Loaded' },
					],
					metadata: { fresh: true },
				},
			} )
		).toMatchObject( {
			sessionId: 'session-1',
			messages: [ { id: 'msg-1', role: 'agent' } ],
			metadata: { fresh: true },
		} );

		expect(
			normalizeRunEvent( { event: 'completed', cursor: '2' }, 'run-1' )
		).toMatchObject( {
			id: 'run-1-completed-2',
			run_id: 'run-1',
			type: 'completed',
		} );
		expect( normalizeRunEvent( { status: 'missing type' } ) ).toBeNull();
	} );

	it( 'groups tool messages and delegates rendering by tool name', () => {
		const message = normalizeAgentsApiMessage( {
			id: 'tool-1',
			role: 'agent',
			name: 'datamachine/get-backlinks',
			result: { count: 3 },
		} );
		const groups = groupToolMessages( [ message ] );
		const renderer = vi.fn( () => 'rendered' );

		expect( groups ).toEqual( [
			{
				id: 'tool-1',
				name: 'datamachine/get-backlinks',
				result: {
					id: 'tool-1',
					message,
					result: { count: 3 },
				},
			},
		] );
		expect(
			renderToolGroups( groups, {
				'datamachine/get-backlinks': renderer,
			} )
		).toEqual( [ 'rendered' ] );
		expect( renderer ).toHaveBeenCalledWith( groups[ 0 ] );
	} );
} );
