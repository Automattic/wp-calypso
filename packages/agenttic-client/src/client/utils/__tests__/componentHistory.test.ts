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
import { serverMessageToMessage } from '../../../react/serverTypes';
import {
	GENERIC_COMPONENT_HISTORY_TEXT,
	getComponentCapabilities,
	getComponentFallbackMetadata,
	normalizeComponentResultPart,
	redactComponentMessages,
	redactComponentTaskUpdate,
	redactComponentToolResultMessage,
} from '../componentHistory';
import { prepareRequest } from '../internal/requests';
import type { ComponentResultPart, Message, TaskUpdate } from '../../types/index';

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

const reference = {
	type: 'component-reference',
	partVersion: 1,
	toolCallId: 'render-1',
	instanceId: 'instance-1',
	protocol: 'agent-component/0.1',
	catalog: 'minimal-ai-ui/0.1',
	summary: GENERIC_COMPONENT_HISTORY_TEXT,
};

describe( 'component history projection', () => {
	afterEach( async () => {
		await clearConversation( 'component-history-test' );
	} );

	it( 'allows 128-character tool-call IDs while keeping instance IDs limited to 64', () => {
		const toolCallId = 't'.repeat( 128 );
		const result = { protocol: 'agent-component/0.1', instanceId: 'i'.repeat( 64 ) };
		const part: ComponentResultPart = {
			type: 'component-result',
			partVersion: 1,
			toolCallId,
			result,
		};
		const fallback = { componentFallback: { partVersion: 1, toolCallId } };
		const project = ( value: ComponentResultPart ) =>
			redactComponentMessages( [ { ...opening, parts: [ value ] } ] )[ 0 ].parts;

		expect( normalizeComponentResultPart( part ) ).toEqual( part );
		expect( getComponentFallbackMetadata( fallback ) ).toEqual( fallback );
		expect( project( part ) ).toContainEqual( {
			...reference,
			toolCallId,
			instanceId: result.instanceId,
		} );
		expect(
			normalizeComponentResultPart( { ...part, toolCallId: toolCallId + 't' } )
		).toBeUndefined();
		expect(
			getComponentFallbackMetadata( {
				componentFallback: { partVersion: 1, toolCallId: toolCallId + 't' },
			} )
		).toBeUndefined();
		for ( const invalid of [
			{ ...part, toolCallId: toolCallId + 't' },
			{ ...part, result: { ...result, instanceId: result.instanceId + 'i' } },
		] ) {
			expect( project( invalid ) ).toEqual( [
				{ type: 'text', text: GENERIC_COMPONENT_HISTORY_TEXT },
			] );
		}
	} );

	it( 'redacts actual extraction and replay without changing the authenticated update', () => {
		const result: Message = {
			role: 'agent',
			parts: [ { type: 'data', data: { toolCallId: 'render-1', result: { body: 'draft body' } } } ],
		};
		const messages = [ opening, result ];
		const replay = conversationMessagesToDataParts( messages );
		expect( extractNewContentFromMessage( opening ).parts[ 0 ] ).toEqual( reference );
		expect( JSON.stringify( replay ) ).not.toContain( 'draft body' );
		expect( JSON.stringify( replay ) ).not.toContain( 'agent-component/0.1' );
		expect( replay[ 1 ] ).toEqual( {
			type: 'data',
			data: {
				role: 'agent',
				text: GENERIC_COMPONENT_HISTORY_TEXT,
			},
		} );
		expect( JSON.stringify( opening ) ).toContain( 'draft body' );
	} );

	it( 'preserves the active tool-result correlation while stripping presentation data', () => {
		const continuation: Message = {
			...opening,
			role: 'user',
			parts: [
				{
					type: 'data',
					data: {
						toolId: 'wpcom__render_components',
						toolCallId: 'render-1',
						result: { instanceId: 'instance-1', surface: { data: 'draft body' } },
					},
				},
			],
		};
		expect( redactComponentToolResultMessage( continuation ).parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolId: 'wpcom__render_components',
					toolCallId: 'render-1',
					result: { instanceId: 'instance-1', message: GENERIC_COMPONENT_HISTORY_TEXT },
				},
			},
		] );
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
				{ type: 'text', text: '[Use wpcom/render-components for buttons.]' },
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
				...opening,
				parts: [
					{
						type: 'text',
						text: '{"protocol":"agent-component/0.2","instanceId":"instance-1","summary":"draft body"',
					},
				],
			},
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
				],
			},
		];
		expect( JSON.stringify( redactComponentMessages( messages ) ) ).not.toContain( 'draft body' );
		expect( JSON.stringify( conversationMessagesToDataParts( messages ) ) ).not.toContain(
			'instance-1'
		);
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
				text: '{"protocol":"agent-component/0.1","secret":"draft body"',
			} ).text
		).toBe( GENERIC_COMPONENT_HISTORY_TEXT );
		expect(
			redactComponentTaskUpdate( {
				...ordinary,
				text: '[Use wpcom/render-components for buttons.]',
			} ).text
		).toBe( '[Use wpcom/render-components for buttons.]' );
	} );

	it( 'projects marked results and correlated raw copies to references and generic replay text', async () => {
		const part = {
			type: 'component-result' as const,
			partVersion: 1 as const,
			toolCallId: 'generic-call',
			result: {
				protocol: 'agent-component/0.1',
				result: {
					protocol: 'agent-component/0.1',
					instanceId: 'instance-1',
					summary: 'draft body',
					surface: { data: { value: 'draft body' } },
				},
				allowedActions: [ 'submit' ],
			},
		};
		const message: Message = {
			...opening,
			parts: [
				part,
				{ type: 'text', text: 'Sensitive email alice@example.com' },
				{
					type: 'data',
					data: { toolCallId: 'generic-call', toolId: 'new/ability', result: part.result },
				},
			],
		};
		const fallback: Message = {
			...opening,
			parts: [ { type: 'text', text: 'draft body' } ],
			metadata: {
				componentFallback: { partVersion: 1, toolCallId: 'generic-call' },
				secret: 'arbitrary metadata',
			},
		};
		await storeConversation( 'component-history-test', [ message, fallback ] );
		const stored = sessionStorage.getItem(
			'a8c_agenttic_conversation_history_component-history-test'
		)!;
		expect( stored ).not.toContain( 'draft body' );
		expect( stored ).not.toContain( 'alice@example.com' );
		expect( stored ).not.toContain( 'arbitrary metadata' );
		expect( JSON.parse( stored ).messages[ 0 ].componentReferences ).toHaveLength( 1 );
		expect( JSON.parse( stored ).messages[ 1 ].componentFallback ).toEqual( {
			partVersion: 1,
			toolCallId: 'generic-call',
		} );
		const loaded = await loadConversation( 'component-history-test' );
		expect( loaded.messages[ 0 ].parts ).toEqual(
			redactComponentMessages( [ message ] )[ 0 ].parts
		);
		expect( loaded.messages[ 1 ].metadata?.componentFallback ).toEqual( {
			partVersion: 1,
			toolCallId: 'generic-call',
		} );
		expect( JSON.stringify( loaded ) ).not.toContain( 'arbitrary metadata' );
		const replay = JSON.stringify( conversationMessagesToDataParts( [ message, fallback ] ) );
		for ( const forbidden of [
			'draft body',
			'alice@example.com',
			'generic-call',
			'instance-1',
			'componentFallback',
			'new/ability',
		] ) {
			expect( replay ).not.toContain( forbidden );
		}
		expect( replay ).toContain( GENERIC_COMPONENT_HISTORY_TEXT );
		expect(
			redactComponentMessages( [ message ] )[ 0 ].parts.filter( ( item ) => item.type === 'text' )
		).toEqual( [ { type: 'text', text: GENERIC_COMPONENT_HISTORY_TEXT } ] );
		expect( normalizeComponentResultPart( { ...part, summary: 'draft body' } ) ).toBeUndefined();
	} );

	it( 'restores references and fallback metadata from session storage without raw snapshots', async () => {
		sessionStorage.setItem(
			'a8c_agenttic_conversation_history_component-history-test',
			JSON.stringify( {
				storageKey: 'component-history-test',
				lastUpdated: 1,
				messages: [
					{
						role: 'agent',
						content: 'draft body',
						timestamp: 1,
						componentFallback: { partVersion: 1, toolCallId: 'generic-call' },
						componentReferences: [
							null,
							{
								type: 'component-reference',
								partVersion: 1,
								toolCallId: 'generic-call',
								instanceId: 'instance-1',
								protocol: 'agent-component/0.1',
								catalog: 'minimal-ai-ui/0.1',
								summary: 'draft body',
								surface: { data: 'draft body' },
							},
						],
					},
				],
			} )
		);
		const restored = await loadConversation( 'component-history-test' );
		expect( restored.messages[ 0 ].metadata?.componentFallback ).toEqual( {
			partVersion: 1,
			toolCallId: 'generic-call',
		} );
		expect( restored.messages[ 0 ].parts.find( ( part ) => part.type === 'text' ) ).toEqual( {
			type: 'text',
			text: GENERIC_COMPONENT_HISTORY_TEXT,
		} );
		expect(
			restored.messages[ 0 ].parts.filter( ( part ) => part.type === 'component-reference' )
		).toHaveLength( 1 );
		expect( JSON.stringify( restored ) ).not.toContain( 'draft body' );
	} );

	it( 'restores fallback identity independently of regenerated server message IDs', () => {
		const serverMessage = {
			message_id: 1,
			role: 'bot' as const,
			content: 'draft body',
			created_at: '2026-09-30 12:00:00',
			context: { componentFallback: { partVersion: 1, toolCallId: 'generic-call' } },
		};
		const restored = serverMessageToMessage( serverMessage );
		const reconnected = serverMessageToMessage( serverMessage );
		expect( restored.messageId ).not.toBe( reconnected.messageId );
		expect( restored.metadata?.componentFallback ).toEqual(
			reconnected.metadata?.componentFallback
		);
		expect( restored.parts ).toEqual( [ { type: 'text', text: GENERIC_COMPONENT_HISTORY_TEXT } ] );
		const unsupported = serverMessageToMessage( {
			...serverMessage,
			context: { componentFallback: { partVersion: 2, toolCallId: 'generic-call' } },
		} );
		expect( unsupported.metadata ).not.toHaveProperty( 'componentFallback' );
		expect( unsupported.parts ).toEqual( [
			{ type: 'text', text: GENERIC_COMPONENT_HISTORY_TEXT },
		] );
		expect(
			getComponentFallbackMetadata( {
				componentFallback: { partVersion: 1, toolCallId: 'generic-call', secret: 'draft body' },
			} )
		).toBeUndefined();
	} );

	it( 'sends capability metadata outside the message only after bootstrap support', async () => {
		const config = {
			agentId: 'test',
			agentUrl: 'https://example.com',
			timeout: 1000,
			componentCapabilities: {
				supported: [
					{
						partVersion: 1 as const,
						protocol: 'agent-component/0.1' as const,
						catalog: 'minimal-ai-ui/0.1' as const,
					},
				],
			},
		};
		const legacy = await prepareRequest( { message: opening }, config, {} );
		expect( legacy.request.params ).not.toHaveProperty( 'componentCapabilities' );
		const supported = await prepareRequest(
			{ message: opening },
			{ ...config, componentTransportVersion: 1 },
			{}
		);
		expect( supported.request.params?.componentCapabilities ).toEqual(
			config.componentCapabilities
		);
		expect( supported.request.params?.message ).not.toHaveProperty( 'componentCapabilities' );
		expect(
			getComponentCapabilities( {
				supported: [
					{ partVersion: 2, protocol: 'agent-component/0.1', catalog: 'minimal-ai-ui/0.1' },
				],
			} )
		).toBeUndefined();
		expect(
			getComponentCapabilities( {
				supported: [
					{
						partVersion: 1,
						protocol: 'agent-component/0.1',
						catalog: 'minimal-ai-ui/0.1',
						secret: 'draft body',
					},
				],
			} )
		).toBeUndefined();
		expect( getComponentCapabilities( { supported: Array( 1 ) } ) ).toBeUndefined();
		expect( getComponentCapabilities( { supported: [] } ) ).toEqual( { supported: [] } );
	} );
} );
