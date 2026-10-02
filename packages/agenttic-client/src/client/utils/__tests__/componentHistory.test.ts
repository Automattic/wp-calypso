import { afterEach, describe, expect, it } from 'vitest';
import {
	clearConversation,
	loadConversation,
	storeConversation,
} from '../../../react/conversationStorage';
import {
	conversationMessagesToDataParts,
	extractNewContentFromMessage,
} from '../../../react/conversationUtils';
import { redactComponentMessages, redactComponentTaskUpdate } from '../componentHistory';
import type { Message, TaskUpdate } from '../../types/index';

const opening: Message = {
	role: 'agent',
	kind: 'message',
	messageId: 'opening',
	parts: [
		{
			type: 'data',
			data: {
				toolCallId: 'render-1',
				toolId: 'wpcom__render_components',
				arguments: {
					protocol: 'agent-component/0.1',
					instanceId: 'instance-1',
					revision: 1,
					surface: { secret: 'draft body' },
				},
			},
		},
	],
};

describe( 'component history projection', () => {
	afterEach( async () => {
		await clearConversation( 'component-history-test' );
	} );

	it( 'redacts actual extraction and replay without changing the authenticated update', () => {
		const result: Message = {
			role: 'agent',
			parts: [ { type: 'data', data: { toolCallId: 'render-1', result: { body: 'draft body' } } } ],
		};
		const messages = [ opening, result ];
		const replay = conversationMessagesToDataParts( messages );
		expect( extractNewContentFromMessage( opening ).parts[ 0 ] ).toEqual( {
			type: 'data',
			data: {
				toolCallId: 'render-1',
				toolId: 'wpcom__render_components',
				arguments: { instanceId: 'instance-1' },
			},
		} );
		expect( JSON.stringify( replay ) ).not.toContain( 'draft body' );
		expect( JSON.stringify( replay ) ).not.toContain( 'agent-component/0.1' );
		expect( replay[ 1 ] ).toEqual( {
			type: 'data',
			data: {
				toolCallId: 'render-1',
				result: { message: 'Interactive component shown in this conversation.' },
			},
		} );
		expect( JSON.stringify( opening ) ).toContain( 'draft body' );
	} );

	it( 'stores only projected references in session storage and the cache', async () => {
		await storeConversation( 'component-history-test', [ opening ] );
		expect(
			sessionStorage.getItem( 'a8c_agenttic_conversation_history_component-history-test' )
		).not.toContain( 'draft body' );
		const loaded = await loadConversation( 'component-history-test' );
		expect( loaded.messages[ 0 ].parts ).toEqual(
			redactComponentMessages( [ opening ] )[ 0 ].parts
		);
	} );

	it( 'preserves legacy pickers, advertised tools and ordinary text', () => {
		const legacy: Message = {
			role: 'agent',
			parts: [
				{
					type: 'text',
					text: '{"tool_id":"big_sky__show_component","data":{"type":"color-picker"}}',
				},
				{ type: 'text', text: 'Use wpcom/render-components for buttons.' },
				{
					type: 'data',
					data: { toolId: 'wpcom/render-components', description: 'Show a button.' },
				},
			],
		};
		expect( redactComponentMessages( [ legacy ] ) ).toEqual( [ legacy ] );
	} );

	it( 'redacts malformed and version-mismatched component results', () => {
		const messages: Message[] = [
			{
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: {
							toolId: 'wpcom/component-action',
							toolCallId: 'action-1',
							result: { secret: 'draft body' },
						},
					},
				],
			},
			{
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: { protocol: 'agent-component/0.2', surface: { secret: 'draft body' } },
					},
					{ type: 'text', text: '{"protocol":"agent-component/0.1","secret":"draft body"' },
				],
			},
		];
		expect( JSON.stringify( redactComponentMessages( messages ) ) ).not.toContain( 'draft body' );
	} );

	it( 'projects external observer updates after transient capture', () => {
		const update: TaskUpdate = {
			id: 'task-1',
			sessionId: 'session-1',
			kind: 'status',
			final: false,
			text: JSON.stringify( {
				protocol: 'agent-component/0.1',
				instanceId: 'instance-1',
				surface: { secret: 'draft body' },
			} ),
			status: {
				state: 'input-required',
				message: {
					...opening,
					parts: [
						...opening.parts,
						{ type: 'data', data: { toolCallId: 'render-1', result: { body: 'draft body' } } },
					],
				},
			},
			agentMessage: {
				role: 'agent',
				parts: [
					{ type: 'data', data: { toolCallId: 'render-1', result: { body: 'draft body' } } },
				],
			},
		};
		const projected = redactComponentTaskUpdate( update );
		expect( projected ).toMatchObject( {
			id: 'task-1',
			sessionId: 'session-1',
			kind: 'status',
			final: false,
			status: { state: 'input-required' },
		} );
		expect( JSON.stringify( projected ) ).not.toContain( 'draft body' );
		expect( JSON.stringify( update ) ).toContain( 'draft body' );
		const ordinary: TaskUpdate = {
			id: 'task-2',
			text: 'Use wpcom/render-components for buttons.',
			status: { state: 'completed' },
			final: true,
		};
		expect( redactComponentTaskUpdate( ordinary ) ).toEqual( ordinary );
		expect(
			redactComponentTaskUpdate( {
				...ordinary,
				text: '[Use wpcom/render-components for buttons.]',
			} ).text
		).toBe( '[Use wpcom/render-components for buttons.]' );
	} );
} );
