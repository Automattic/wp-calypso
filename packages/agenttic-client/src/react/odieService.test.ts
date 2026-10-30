import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadAllMessagesFromServer } from './odieService';
import type { ServerChat } from './serverTypes';

const pending = {
	state: 'unanswered' as const,
	calls: [ { toolCallId: 'call-1', toolId: 'top_products', arguments: {} } ],
};

const page = ( currentPage: number, extra: Partial< ServerChat > = {} ): ServerChat => ( {
	chat_id: 1,
	bot_id: 'wpcom-agent',
	session_id: 'session-1',
	messages: [],
	created_at: '2026-10-01 10:00:00',
	updated_at: '2026-10-01 10:00:00',
	metadata: {
		total_messages: 60,
		current_page: currentPage,
		items_per_page: 50,
		total_pages: 2,
	},
	...extra,
} );

const respond = ( body: ServerChat ) =>
	( { ok: true, json: async () => body } ) as unknown as Response;

describe( 'loadAllMessagesFromServer', () => {
	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'keeps the pending browser tool calls of a conversation over one page', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn( async ( url: string ) =>
				respond(
					new URL( url ).searchParams.get( 'page_number' ) === '1'
						? page( 1, { pending_client_tools: pending } )
						: page( 2 )
				)
			)
		);

		const result = await loadAllMessagesFromServer( 'session-1', { botId: 'wpcom-agent' } );

		expect( result.pendingClientTools ).toEqual( pending );
	} );

	it( 'keeps them when a later page fails to load', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn( async ( url: string ) => {
				if ( new URL( url ).searchParams.get( 'page_number' ) !== '1' ) {
					throw new Error( 'network' );
				}
				return respond( page( 1, { pending_client_tools: pending } ) );
			} )
		);

		const result = await loadAllMessagesFromServer( 'session-1', { botId: 'wpcom-agent' } );

		expect( result.pendingClientTools ).toEqual( pending );
	} );

	it( 'gives an ID that rows on two pages share to the newest row only', async () => {
		const retried = ( message_id: number ) => ( {
			message_id,
			role: 'user' as const,
			content: 'Hi',
			created_at: '2026-10-01 10:00:00',
			a2a_message_id: 'a2a-1',
		} );
		vi.stubGlobal(
			'fetch',
			vi.fn( async ( url: string ) =>
				respond(
					new URL( url ).searchParams.get( 'page_number' ) === '1'
						? page( 1, { messages: [ retried( 60 ) ] } )
						: page( 2, { messages: [ retried( 10 ) ] } )
				)
			)
		);

		const result = await loadAllMessagesFromServer( 'session-1', { botId: 'wpcom-agent' } );

		expect( result.messages.map( ( message ) => message.messageId ) ).toEqual( [ 'a2a-1', '10' ] );
	} );
} );
