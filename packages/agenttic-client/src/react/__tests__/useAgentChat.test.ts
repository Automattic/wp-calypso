import { describe, expect, it } from 'vitest';
import {
	filterUiOnlyMessages,
	transformClientMessageToUI,
} from '../useAgentChat';
import type { UIMessage } from '../useAgentChat';
import type { Message as ClientMessage, Part } from '../../client/types/index';

describe( 'useAgentChat', () => {
	describe( 'UI-only message filtering', () => {
		const createMessage = (
			id: string,
			role: 'user' | 'agent',
			contentType: 'text' | 'component' = 'text'
		): UIMessage => ( {
			id,
			role,
			content: [
				{
					type: contentType,
					...( contentType === 'text' ? { text: 'test' } : {} ),
				},
			],
			timestamp: Date.now(),
			archived: false,
			showIcon: true,
		} );

		it( 'should preserve assistant text messages injected by tools', () => {
			// Simulate messages in UI state
			const uiMessages: UIMessage[] = [
				createMessage( 'msg-1', 'agent', 'text' ), // Text message from tool
				createMessage( 'msg-2', 'agent', 'component' ), // Component message from tool
			];

			// Client history has neither of these (they were injected by tools)
			const clientMessageIds = new Set< string >();

			const preserved = filterUiOnlyMessages(
				uiMessages,
				clientMessageIds
			);

			// Both should be preserved - text AND component messages from tools
			expect( preserved ).toHaveLength( 2 );
			expect( preserved.map( ( m ) => m.id ) ).toEqual( [
				'msg-1',
				'msg-2',
			] );
		} );

		it( 'should not preserve user messages that are not in client history', () => {
			// User messages get new IDs from server, so they won't match
			// We should NOT preserve them as UI-only (they'll come back transformed)
			const uiMessages: UIMessage[] = [
				createMessage( 'local-user-msg', 'user', 'text' ),
				createMessage( 'tool-injected-msg', 'agent', 'text' ),
			];

			const clientMessageIds = new Set< string >();

			const preserved = filterUiOnlyMessages(
				uiMessages,
				clientMessageIds
			);

			// Only the agent message should be preserved
			expect( preserved ).toHaveLength( 1 );
			expect( preserved[ 0 ].id ).toBe( 'tool-injected-msg' );
		} );

		it( 'should not preserve messages that exist in client history', () => {
			const uiMessages: UIMessage[] = [
				createMessage( 'server-msg-1', 'agent', 'text' ),
				createMessage( 'tool-msg', 'agent', 'component' ),
			];

			// server-msg-1 came from the server (in client history)
			const clientMessageIds = new Set( [ 'server-msg-1' ] );

			const preserved = filterUiOnlyMessages(
				uiMessages,
				clientMessageIds
			);

			// Only the tool-injected message should be preserved
			expect( preserved ).toHaveLength( 1 );
			expect( preserved[ 0 ].id ).toBe( 'tool-msg' );
		} );

		it( 'should preserve both text and component assistant messages from tools', () => {
			// This is the key scenario: tools inject both a text message
			// ("Are you sure you want to start over?") and a component message
			// (ChatSuggestions with Yes/No buttons)
			const uiMessages: UIMessage[] = [
				createMessage( 'confirmation-text', 'agent', 'text' ),
				createMessage( 'confirmation-buttons', 'agent', 'component' ),
			];

			const clientMessageIds = new Set< string >();

			const preserved = filterUiOnlyMessages(
				uiMessages,
				clientMessageIds
			);

			// Both should be preserved for the UI
			expect( preserved ).toHaveLength( 2 );
			expect( preserved.map( ( m ) => m.content[ 0 ].type ) ).toEqual( [
				'text',
				'component',
			] );
		} );
	} );

	describe( 'transformClientMessageToUI', () => {
		const buildMessage = ( parts: Part[] ): ClientMessage => ( {
			messageId: 'msg-1',
			role: 'agent',
			kind: 'message',
			parts,
		} );

		it( 'drops the entire message for tool calls and tool results', () => {
			// Tool-related messages are handled upstream and must not surface in the UI.
			const toolCall = transformClientMessageToUI(
				buildMessage( [
					{
						type: 'data',
						data: {
							toolCallId: 'tc-1',
							toolId: 'wpcom__think',
							arguments: { thought: 'hi' },
						},
					},
				] )
			);
			const toolResult = transformClientMessageToUI(
				buildMessage( [
					{
						type: 'data',
						data: {
							toolCallId: 'tc-1',
							toolId: 'wpcom__think',
							result: 'ok',
						},
					},
				] )
			);

			expect( toolCall ).toBeNull();
			expect( toolResult ).toBeNull();
		} );

		it( 'drops the entire message when only unknown `data` parts remain', () => {
			// Internal metadata must never reach the UI. With nothing left to
			// show, the whole message is dropped so it doesn't add an empty
			// entry or throw off message counts.
			const result = transformClientMessageToUI(
				buildMessage( [
					{
						type: 'data',
						data: {
							route: 'premium',
							route_reasoning: 'because…',
							eligible_abilities: 'a,b,c',
						},
					},
				] )
			);

			expect( result ).toBeNull();
		} );

		it( 'drops a message that has no parts', () => {
			// Nothing to render, so the message is dropped rather than left as
			// an empty entry in the list.
			expect(
				transformClientMessageToUI( buildMessage( [] ) )
			).toBeNull();
		} );

		it( 'preserves `component` + `componentProps` data parts', () => {
			const Component = () => null;
			const componentProps = { foo: 'bar' };
			const result = transformClientMessageToUI(
				buildMessage( [
					{
						type: 'data',
						data: { component: Component, componentProps },
					},
				] )
			);

			expect( result?.content ).toEqual( [
				{ type: 'component', component: Component, componentProps },
			] );
		} );

		it( 'preserves `sources` data parts', () => {
			const sources = [ { title: 't', url: 'u' } ];
			const result = transformClientMessageToUI(
				buildMessage( [ { type: 'data', data: { sources } } ] )
			);

			expect( result?.content ).toEqual( [
				{ type: 'data', data: { sources } },
			] );
		} );

		it( 'preserves `forward_to_human_support` flag data parts', () => {
			const flags = { forward_to_human_support: true };
			const result = transformClientMessageToUI(
				buildMessage( [ { type: 'data', data: { flags } } ] )
			);

			expect( result?.content ).toEqual( [
				{ type: 'data', data: { flags } },
			] );
		} );

		it( 'keeps `text` content and drops unknown `data` in the same message', () => {
			const result = transformClientMessageToUI(
				buildMessage( [
					{ type: 'text', text: 'hello' },
					{ type: 'data', data: { route: 'premium' } },
				] )
			);

			expect( result?.content ).toEqual( [
				{ type: 'text', text: 'hello' },
			] );
		} );
	} );
} );
