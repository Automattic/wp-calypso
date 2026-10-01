import { describe, expect, it } from 'vitest';
import { serverChatToLoadResult, type ServerChat } from './serverTypes';

const chat = ( extra: Partial< ServerChat > = {} ): ServerChat => ( {
	chat_id: 1,
	bot_id: 'wpcom-agent',
	session_id: 'session-1',
	messages: [],
	created_at: '2026-10-01 10:00:00',
	updated_at: '2026-10-01 10:00:00',
	...extra,
} );

describe( 'serverChatToLoadResult', () => {
	it( 'passes the pending browser tool calls through', () => {
		const pending = {
			state: 'unanswered' as const,
			calls: [
				{
					toolCallId: 'call-1',
					toolId: 'top_products',
					arguments: {},
					createdAt: '2026-10-01 10:00:00',
				},
			],
			completed: [],
		};

		expect(
			serverChatToLoadResult( chat( { pending_client_tools: pending } ) ).pendingClientTools
		).toEqual( pending );
	} );

	it( 'leaves the field out when nothing is pending', () => {
		expect( 'pendingClientTools' in serverChatToLoadResult( chat() ) ).toBe( false );
	} );
} );
