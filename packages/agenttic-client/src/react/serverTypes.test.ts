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
				},
			],
		};

		expect(
			serverChatToLoadResult( chat( { pending_client_tools: pending } ) ).pendingClientTools
		).toEqual( pending );
	} );

	it( 'leaves the field out when nothing is pending', () => {
		expect( 'pendingClientTools' in serverChatToLoadResult( chat() ) ).toBe( false );
	} );
} );

it.each( [ true, false ] )(
	'preserves approval records independently of message pagination only when opted in (%s)',
	( enabled ) => {
		const request = {
			version: 1,
			proposalId: 'old-proposal',
			chatId: 1,
			consumer: 'wp-agent',
			origin: 'execute',
			state: 'pending',
			ability: 'wpcom/example',
			description: 'Remove plugin',
			notice: 'Removes data',
			allowForChat: false,
			decided_at: null,
			outcome: null,
		};
		const history = serverChatToLoadResult(
			chat( {
				approvals: [ request ],
				messages: Array.from( { length: 12 }, ( _, index ) => ( {
					message_id: index + 1,
					role: 'bot',
					content: 'Later message',
					created_at: '2026-10-01 10:00:00',
				} ) ),
			} ),
			true,
			enabled
		);
		expect( history.messages ).toHaveLength( 12 );
		if ( enabled ) {
			expect( history.approvals ).toHaveLength( 1 );
			expect( history.approvals?.[ 0 ].proposalId ).toBe( request.proposalId );
			expect( history.approvals?.[ 0 ].state ).toBe( 'pending' );
		} else {
			expect( history ).not.toHaveProperty( 'approvals' );
		}
		expect( serverChatToLoadResult( chat(), true, enabled ) ).not.toHaveProperty( 'approvals' );
	}
);

it( 'rejects an approval record bound to a different numeric chat', () => {
	const request = {
		version: 1,
		proposalId: 'wrong-chat',
		chatId: 2,
		consumer: 'wp-agent',
		origin: 'execute',
		state: 'pending',
		ability: 'wpcom/example',
		description: 'Remove plugin',
		notice: 'Removes data',
		allowForChat: false,
	};
	expect( () =>
		serverChatToLoadResult( chat( { approvals: [ request ] } ), true, true )
	).toThrow();
} );

it( 'retains a history card at its tool-call position without exposing an executable call', () => {
	const approval = {
		version: 1,
		proposalId: 'position',
		chatId: 1,
		consumer: 'wp-agent',
		origin: 'execute',
		state: 'pending',
		ability: 'wpcom/example',
		description: 'Remove plugin',
		notice: '',
		allowForChat: false,
	};
	const messages: ServerChat[ 'messages' ] = [
		{ message_id: 1, role: 'bot', content: 'Intro', created_at: '2026-10-01 10:00:00' },
		{
			message_id: 2,
			role: 'tool_call',
			content: '{"tool_id":"example"}',
			context: { approval },
			created_at: '2026-10-01 10:00:01',
		},
		{ message_id: 3, role: 'bot', content: 'Continuation', created_at: '2026-10-01 10:00:02' },
	];
	const result = serverChatToLoadResult(
		chat( { messages, approvals: [ approval ] } ),
		true,
		true
	);
	expect( result.messages.map( ( item ) => item.metadata?.serverId ) ).toEqual( [ 1, 2, 3 ] );
	expect(
		result.messages[ 1 ].parts.every(
			( part ) => part.type === 'data' && 'approvalRequest' in part.data
		)
	).toBe( true );
} );
