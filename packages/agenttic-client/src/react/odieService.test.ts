import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadAllMessagesFromServer } from './odieService';
import type { ServerChat } from './serverTypes';

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
};

const page = ( currentPage: number, extra: Partial< ServerChat > = {} ): ServerChat => ( {
	chat_id: 1,
	bot_id: 'wpcom-agent',
	messages: [
		{
			message_id: currentPage,
			role: 'user',
			content: `Question ${ currentPage }`,
			created_at: '2026-10-01 10:00:00',
		},
	],
	metadata: { total_messages: 2, current_page: currentPage, items_per_page: 50, total_pages: 2 },
	created_at: '2026-10-01 10:00:00',
	updated_at: '2026-10-01 10:00:00',
	...extra,
} );

describe( 'loadAllMessagesFromServer', () => {
	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( "keeps page 1's session and pending browser tool calls when it merges pages", async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn( async ( url: string ) => {
				const pageNumber = Number( new URL( url ).searchParams.get( 'page_number' ) );
				const body =
					pageNumber === 1
						? page( 1, { session_id: 'session-1', pending_client_tools: pending } )
						: page( 2 );
				return { ok: true, json: async () => body };
			} )
		);

		const result = await loadAllMessagesFromServer( 'session-1', { botId: 'wpcom-agent' } );

		expect( result.messages ).toHaveLength( 2 );
		expect( result.sessionId ).toBe( 'session-1' );
		expect( result.pendingClientTools ).toEqual( pending );
	} );
} );
