import { describe, expect, it, vi } from 'vitest';
import {
	groupToolMessages,
	normalizeAgentsApiMessage,
	normalizeLoadedSession,
	normalizeRunEvent,
	normalizeSendResponse,
	normalizeSessions,
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
