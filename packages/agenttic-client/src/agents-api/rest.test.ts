import { describe, expect, it, vi } from 'vitest';
import {
	agentsApiDeleteSession,
	agentsApiListSessions,
	agentsApiLoadSession,
	agentsApiMarkSessionRead,
	agentsApiSendMessage,
	createAgentsApiChatAdapter,
} from './rest';
import type { AgentsApiFetch } from './types';

describe( 'createAgentsApiChatAdapter', () => {
	it( 'builds Agents API chat request paths and payloads', async () => {
		const fetchFn = vi.fn< AgentsApiFetch >( async () => ( { ok: true } ) );
		const adapter = createAgentsApiChatAdapter( {
			agent: 'example',
			basePath: '/frontend-agent-chat/v1/agents/example/chat',
			fetchFn,
		} );

		await agentsApiSendMessage( adapter, {
			message: 'Hello',
			sessionId: 'session/1',
			attachments: [ { media_id: 123 } ],
		} );
		await agentsApiListSessions( adapter );
		await agentsApiLoadSession( adapter, 'session/1' );
		await agentsApiMarkSessionRead( adapter, 'session/1' );
		await agentsApiDeleteSession( adapter, 'session/1' );

		expect( fetchFn.mock.calls.map( ( [ request ] ) => request ) ).toEqual(
			[
				{
					path: '/frontend-agent-chat/v1/agents/example/chat',
					method: 'POST',
					data: {
						agent: 'example',
						message: 'Hello',
						session_id: 'session/1',
						attachments: [ { media_id: 123 } ],
					},
				},
				{
					path: '/frontend-agent-chat/v1/agents/example/chat/sessions?agent=example',
				},
				{
					path: '/frontend-agent-chat/v1/agents/example/chat/session%2F1?agent=example',
				},
				{
					path: '/frontend-agent-chat/v1/agents/example/chat/sessions/session%2F1/read?agent=example',
					method: 'POST',
				},
				{
					path: '/frontend-agent-chat/v1/agents/example/chat/session%2F1?agent=example',
					method: 'DELETE',
				},
			]
		);
	} );
} );
