function mockEscalationButton() {
	return null;
}

const mockResponseAction = jest.fn();

function mockCreateChatResponseActionCallback() {
	return mockResponseAction;
}

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		createOdieBotId: ( agentId: string ) => `odie-${ agentId }`,
		isOdieBotId: () => false,
		loadAllMessagesFromServer: jest.fn(),
	} ),
	{ virtual: true }
);
jest.mock( '../../components/escalation-button', () => ( {
	EscalationButton: mockEscalationButton,
} ) );
jest.mock( '../../components/button-picker', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( '../../components/color-picker', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( '../../components/font-picker', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( '../../components/chat-response-tracking', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
	createChatResponseActionCallback: mockCreateChatResponseActionCallback,
} ) );

import { render, waitFor } from '@testing-library/react';
import { createElement } from '@wordpress/element';
import ButtonPicker from '../../components/button-picker';
import ChatResponseRenderedTracker from '../../components/chat-response-tracking';
import ColorPicker from '../../components/color-picker';
import FontPicker from '../../components/font-picker';
import convertToolMessagesToComponents from '../convert-tool-messages-to-components';
import {
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
} from '../show-component-tools';
import type { UIMessage } from '@automattic/agenttic-client';

const MockComponent = jest.fn();
const SHOW_COMPONENT_TOOL_ID = JETPACK_AI_SHOW_COMPONENT_TOOL_ID;
const LEGACY_SHOW_COMPONENT_TOOL_ID = BIG_SKY_SHOW_COMPONENT_TOOL_ID;

const createMessage = ( overrides: Partial< UIMessage > = {} ): UIMessage =>
	( {
		id: 'msg-1',
		role: 'agent',
		content: [ { type: 'text', text: 'Hello' } ],
		...overrides,
	} ) as UIMessage;

const createToolMessage = (
	toolId: string,
	data?: object | string,
	overrides?: Partial< UIMessage >
): UIMessage =>
	createMessage( {
		content: [ { type: 'text', text: JSON.stringify( { tool_id: toolId, data } ) } ],
		...overrides,
	} );

const createApplyBlockEditsMessage = (
	toolCallId: string,
	data: object,
	overrides?: Partial< UIMessage >
): UIMessage =>
	createMessage( {
		content: [
			{
				type: 'text',
				text: JSON.stringify( {
					tool_id: 'big_sky__apply_block_edits',
					tool_call_id: toolCallId,
					data,
				} ),
			},
		],
		...overrides,
	} );

describe( 'convertToolMessagesToComponents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'passes through user messages unchanged', () => {
		const message = createMessage( { role: 'user' } );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'passes through plain-text agent messages unchanged', () => {
		const message = createMessage( {
			content: [ { type: 'text', text: 'Hello, how can I help?' } ],
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [ message ] );
	} );

	it.each( [ '2', '0', '-1', '2.5', 'true', 'false', 'null', '"hello"', '[]', '{}' ] )(
		'passes through JSON-looking agent text %s unchanged',
		( text ) => {
			const message = createMessage( {
				content: [ { type: 'text', text } ],
			} );

			const result = convertToolMessagesToComponents( {
				messages: [ message ],
			} );

			expect( result ).toEqual( [ message ] );
		}
	);

	it.each( [
		{
			name: 'context flags',
			message: createMessage( {
				content: [ { type: 'text', text: 'This is only context for the model.' } ],
				context: { flags: { context_only: true } },
			} as Partial< UIMessage > ),
		},
		{
			name: 'context content',
			message: createMessage( {
				content: [ { type: 'context', text: 'This is only context for the model.' } ],
			} ),
		},
		{
			name: 'context-only data flags',
			message: createMessage( {
				content: [
					{ type: 'text', text: 'This is only context for the model.' },
					{ type: 'data', data: { flags: { context_only: true } } },
				],
			} ),
		},
	] )( 'filters out messages with $name', ( { message } ) => {
		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'renders tool messages as components', () => {
		const message = createMessage( {
			content: [
				{
					type: 'text',
					text: JSON.stringify( {
						tool_id: SHOW_COMPONENT_TOOL_ID,
						tool_call_id: 'tool-call-1',
						data: {
							type: 'my-component',
							props: { name: 'test' },
							responseTrackingProperties: { suggested_edit_count: 2 },
							summary: 'Choose one of these options.',
							isCurrent: true,
						},
					} ),
				},
			],
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: 'Choose one of these options.',
		} );
		expect( result[ 0 ].content[ 1 ] ).toMatchObject( {
			type: 'component',
			component: MockComponent,
			componentProps: {
				name: 'test',
				summary: 'Choose one of these options.',
				contentType: 'my-component',
				onResponseAction: mockResponseAction,
			},
		} );
		expect( result[ 0 ].content[ 2 ] ).toMatchObject( {
			type: 'component',
			component: ChatResponseRenderedTracker,
			componentProps: {
				componentType: 'my-component',
				toolId: SHOW_COMPONENT_TOOL_ID,
				toolCallId: 'tool-call-1',
				responseTrackingProperties: { suggested_edit_count: 2 },
			},
		} );
	} );

	it( 'renders the provider component for a migrated type with `?am_abilities=0`', () => {
		window.history.replaceState( {}, '', '/?am_abilities=0' );
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'color-picker',
			props: { variations: [] },
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( getChatComponent ).toHaveBeenCalledWith( 'color-picker' );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( { component: MockComponent } );
	} );

	it( 'renders legacy Big Sky show-component messages during migration', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			props: { name: 'test' },
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: MockComponent,
			componentProps: { name: 'test', contentType: 'my-component' },
		} );
	} );

	it( 'omits the summary text when the summary is blank', () => {
		const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			summary: '   ',
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result[ 0 ].content ).toHaveLength( 2 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( { type: 'component' } );
		expect( result[ 0 ].content[ 0 ].componentProps.summary ).toBeUndefined();
		expect( result[ 0 ].content[ 1 ] ).toMatchObject( {
			component: ChatResponseRenderedTracker,
		} );
	} );

	it( 'does not suppress the thinking indicator for component messages with follow-up tasks', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result[ 0 ].suppressThinking ).toBe( false );
	} );

	it( 'renders the provider pattern picker disabled for history rows', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'pattern-picker',
			props: { patterns: [] },
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( { component: MockComponent } );
		// History rows carry no `isCurrent`, so the message renders inert.
		expect( result[ 0 ].disabled ).toBe( true );
		expect( result[ 0 ].content ).toHaveLength( 1 );
	} );

	it( 'renders the notice for prototype-member component types', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'toString',
			props: { name: 'test' },
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'This option is no longer available.' },
		] );
	} );

	it( 'renders a short notice when no component resolves on either side', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'unknown-component',
		} );
		const getChatComponent = jest.fn().mockReturnValue( null );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'This option is no longer available.' },
		] );
	} );

	it( 'renders consecutive follow-up pickers as components', () => {
		const data = { type: 'my-component', followUpTasks: true, isCurrent: true };
		const actions = [
			{ id: 'action-1', label: 'Do something', onClick: jest.fn() },
		] as UIMessage[ 'actions' ];
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [
				createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, data, { id: 'msg-1', actions } ),
				createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, data, { id: 'msg-2', actions } ),
			],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 2 );
		expect( result.map( ( message ) => message.id ) ).toEqual( [ 'msg-1', 'msg-2' ] );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( { component: MockComponent } );
		expect( result[ 1 ].content[ 0 ] ).toMatchObject( { component: MockComponent } );
		// Message actions are resolved before conversion and must survive it.
		expect( result[ 0 ].actions ).toEqual( actions );
	} );

	it( 'renders the start-over notice for the legacy start-over tool', () => {
		const message = createToolMessage( 'big_sky__client_assistants', {
			assistantId: 'big-sky-site-admin',
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toEqual( {
			type: 'text',
			text: 'To start over, please send your request again.',
		} );
	} );

	it.each( [
		{
			name: 'support tool text',
			toolId: 'big_sky__wordpress_com_support',
			data: 'Here is some help for your domain question.',
			expected: 'Here is some help for your domain question.',
		},
		{
			name: 'apply-block-edits summary',
			toolId: 'big_sky__apply_block_edits',
			data: {
				summary: 'Updated the heading and added a new paragraph.',
				calypsoCheckpointId: 'checkpoint-1',
			},
			expected: 'Updated the heading and added a new paragraph.',
		},
		{
			name: 'legacy apply-block-edits structured result',
			toolId: 'big_sky__apply_block_edits',
			data: {
				result: {
					success: true,
					message: 'Updated the header and footer.',
				},
			},
			expected: 'Updated the header and footer.',
		},
		{
			name: 'stream-page-design summary',
			toolId: 'big_sky__stream_page_design',
			data: {
				summary: 'A bold hero with three airy feature sections in the theme accent colors.',
				isCurrent: true,
			},
			expected: 'A bold hero with three airy feature sections in the theme accent colors.',
		},
		{
			name: 'stream-page-design structured result',
			toolId: 'big_sky__stream_page_design',
			data: {
				result: {
					success: true,
					message: 'The generated page content has been staged in the editor for review.',
				},
				returnToAgent: true,
			},
			expected: 'The generated page content has been staged in the editor for review.',
		},
		{
			name: 'update-theme structured result',
			toolId: 'big_sky__apply_update_theme',
			data: {
				result: { success: true, message: 'Updated the color palette.' },
			},
			expected: 'Updated the color palette.',
		},
		{
			name: 'open-image-studio structured result',
			toolId: 'jetpack_ai__open_image_studio',
			data: {
				result: { success: true, message: 'Click the button below to open the image editor.' },
				returnToAgent: true,
			},
			expected: 'Click the button below to open the image editor.',
		},
	] )( 'renders $name as plain text', ( { toolId, data, expected } ) => {
		const result = convertToolMessagesToComponents( {
			messages: [ createToolMessage( toolId, data ) ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: expected,
		} );
	} );

	it.each( [ 'big_sky__apply_block_edits', 'wpcom__update_block_content' ] )(
		'hides a request-shaped %s message until the client reports its outcome',
		( toolId ) => {
			const message = createToolMessage( toolId, {
				summary: 'Corrected the grammar in the selected paragraph.',
				updates: [ { clientId: 'block-1' } ],
			} );

			expect( convertToolMessagesToComponents( { messages: [ message ] } ) ).toEqual( [] );
		}
	);

	it( 'hides a successful Jetpack result without an explicit outcome', () => {
		const message = createToolMessage( 'wpcom__update_block_content', {
			result: {
				success: true,
				message: 'Corrected the grammar in the selected paragraph.',
			},
		} );

		expect( convertToolMessagesToComponents( { messages: [ message ] } ) ).toEqual( [] );
	} );

	it.each( [ 'big_sky__apply_block_edits', 'wpcom__update_block_content' ] )(
		'keeps only the concrete summary for a successful %s edit',
		( toolId ) => {
			const message = createToolMessage( toolId, {
				result: {
					success: true,
					message: 'Corrected the grammar in the selected paragraph.',
					outcome: 'updated',
					details: { appliedOperations: { modified: 1 } },
				},
			} );

			const result = convertToolMessagesToComponents( { messages: [ message ] } );

			expect( result[ 0 ].content ).toEqual( [
				{ type: 'text', text: 'Corrected the grammar in the selected paragraph.' },
			] );
		}
	);

	it.each( [ 'big_sky__apply_block_edits', 'wpcom__update_block_content' ] )(
		'replaces a successful no-op %s summary with a clear outcome',
		( toolId ) => {
			const message = createToolMessage( toolId, {
				result: {
					success: true,
					message: 'Corrected the grammar in the selected paragraph.',
					outcome: 'no-changes',
				},
			} );

			const result = convertToolMessagesToComponents( { messages: [ message ] } );

			expect( result[ 0 ].content ).toEqual( [ { type: 'text', text: '✓ No changes needed' } ] );
		}
	);

	it( 'renders an explicit Jetpack no-op outcome even when no summary was provided', () => {
		const message = createToolMessage( 'wpcom__update_block_content', {
			result: {
				success: true,
				outcome: 'no-changes',
			},
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result[ 0 ].content ).toEqual( [ { type: 'text', text: '✓ No changes needed' } ] );
	} );

	it( 'replaces the requested edit payload with its authoritative applied outcome', () => {
		const requestedEdit = createApplyBlockEditsMessage(
			'tool-call-1',
			{
				updates: [ { clientId: 'block-1' } ],
				summary: 'Corrected one misspelling.',
				followUpTasks: false,
			},
			{ id: 'requested-edit' }
		);
		const appliedOutcome = createApplyBlockEditsMessage(
			'tool-call-1',
			{
				result: {
					success: true,
					message: 'Corrected one misspelling.',
					outcome: 'updated',
				},
				followUpTasks: false,
			},
			{ id: 'applied-outcome' }
		);

		const result = convertToolMessagesToComponents( {
			messages: [ requestedEdit, appliedOutcome ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'applied-outcome' );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'Corrected one misspelling.' },
		] );
	} );

	it( 'suppresses trailing prose after a terminal no-change outcome', () => {
		const noChangeOutcome = createApplyBlockEditsMessage(
			'tool-call-1',
			{
				result: {
					success: true,
					message: 'The requested changes were already applied.',
					outcome: 'no-changes',
				},
				followUpTasks: false,
			},
			{ id: 'no-change-outcome' }
		);
		const prose = createMessage( {
			id: 'prose',
			content: [
				{
					type: 'text',
					text: 'The paragraph reads well overall, with some optional style advice.',
				},
			],
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ noChangeOutcome, prose ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'no-change-outcome' );
		expect( result[ 0 ].content ).toEqual( [ { type: 'text', text: '✓ No changes needed' } ] );
	} );

	it( 'suppresses duplicate trailing prose after a terminal applied outcome', () => {
		const appliedOutcome = createApplyBlockEditsMessage(
			'tool-call-1',
			{
				result: {
					success: true,
					message: 'Corrected one misspelling.',
					outcome: 'updated',
				},
				followUpTasks: false,
			},
			{ id: 'applied-outcome' }
		);
		const prose = createMessage( {
			id: 'prose',
			content: [
				{
					type: 'text',
					text: 'I corrected one misspelling in the selected paragraph.',
				},
			],
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ appliedOutcome, prose ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'applied-outcome' );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'Corrected one misspelling.' },
		] );
	} );

	it( 'filters out unsuccessful apply-block-edits tool summaries', () => {
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			success: false,
			summary: 'Tried to update the header, but it did not stick.',
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'suppresses transient thinking for converted apply-block-edits messages', () => {
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			followUpTasks: true,
			result: {
				success: true,
				message: 'Updated the header and footer.',
				outcome: 'updated',
			},
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result[ 0 ].suppressThinking ).toBe( true );
	} );

	it( 'hides intermediate apply-block-edits summaries when a later tool response exists in the same turn', () => {
		const intermediateMessage = createToolMessage(
			'big_sky__apply_block_edits',
			{
				followUpTasks: true,
				summary: 'Updated the heading.',
			},
			{ id: 'tool-1' }
		);
		const finalMessage = createToolMessage(
			LEGACY_SHOW_COMPONENT_TOOL_ID,
			{
				type: 'color-picker',
				summary: 'Pick a blue palette.',
				isCurrent: true,
			},
			{ id: 'tool-2' }
		);
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ intermediateMessage, finalMessage ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'tool-2' );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: 'Pick a blue palette.',
		} );
	} );

	it( 'renders `EscalationButton` when `forward_to_human_support` flag is set', () => {
		const message = createMessage( {
			content: [
				{ type: 'text', text: 'Hello' },
				{
					type: 'data',
					data: { flags: { forward_to_human_support: true } },
				},
			],
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: mockEscalationButton,
			componentProps: {
				messageId: 'msg-1',
			},
		} );
	} );

	it( 'filters out unhandled tool messages', () => {
		const result = convertToolMessagesToComponents( {
			messages: [ createToolMessage( 'other_tool' ) ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'filters out a plain-text agent message that duplicates an adjacent show-component summary', () => {
		const summary = 'Pick a palette from beyond the grave.';
		const toolMessage = createToolMessage(
			SHOW_COMPONENT_TOOL_ID,
			{ type: 'color-picker', summary, isCurrent: true },
			{ id: 'tool-1' }
		);
		const prose = createMessage( {
			id: 'prose-1',
			content: [ { type: 'text', text: summary } ],
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ toolMessage, prose ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'tool-1' );
	} );

	it( 'keeps a plain-text agent message that does not match any adjacent tool summary', () => {
		const prose = createMessage( {
			id: 'prose-1',
			content: [ { type: 'text', text: 'Different prose entirely.' } ],
		} );
		const toolMessage = createToolMessage(
			'big_sky__apply_block_edits',
			{
				result: {
					success: true,
					message: 'Updated the header.',
					outcome: 'updated',
				},
			},
			{ id: 'tool-1' }
		);

		const result = convertToolMessagesToComponents( {
			messages: [ prose, toolMessage ],
		} );

		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ].id ).toBe( 'prose-1' );
	} );

	it( 'keeps a plain-text agent message when the matching tool is not adjacent', () => {
		const summary = 'Ooooh, rising from the typographic beyond.';
		const toolMessage = createToolMessage(
			SHOW_COMPONENT_TOOL_ID,
			{ type: 'font-picker', summary, isCurrent: true },
			{ id: 'tool-1' }
		);
		const userMessage = createMessage( {
			id: 'user-1',
			role: 'user',
			content: [ { type: 'text', text: 'make this shorter' } ],
		} );
		const prose = createMessage( {
			id: 'prose-1',
			content: [ { type: 'text', text: summary } ],
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ toolMessage, userMessage, prose ],
			getChatComponent,
		} );

		// A user message sits between the tool and the prose, so the prose
		// isn't adjacent and shouldn't be dropped.
		expect( result ).toHaveLength( 3 );
		expect( result.map( ( m ) => m.id ) ).toEqual( [ 'tool-1', 'user-1', 'prose-1' ] );
	} );

	const stalenessCases: Array< {
		name: string;
		data: Record< string, unknown >;
		currentPostId?: number | string;
		laterMessages?: UIMessage[];
		disabled: boolean;
	} > = [
		{
			name: 'is disabled when `isCurrent` is false',
			data: { type: 'my-component', isCurrent: false },
			disabled: true,
		},
		{
			name: 'is disabled when `postId` differs from `currentPostId`',
			data: { type: 'my-component', isCurrent: true, postId: 10 },
			currentPostId: 20,
			disabled: true,
		},
		{
			name: 'stays enabled when `postId` matches `currentPostId`',
			data: { type: 'my-component', isCurrent: true, postId: 10 },
			currentPostId: 10,
			disabled: false,
		},
		{
			name: 'stays enabled when string `postId` matches `currentPostId`',
			data: { type: 'my-component', isCurrent: true, postId: 'theme//front-page' },
			currentPostId: 'theme//front-page',
			disabled: false,
		},
		{
			name: 'stays enabled when a number `postId` matches a string `currentPostId`',
			data: { type: 'my-component', isCurrent: true, postId: 10 },
			currentPostId: '10',
			disabled: false,
		},
		{
			name: 'stays enabled when `postId` is missing from the tool message',
			data: { type: 'my-component', isCurrent: true },
			currentPostId: 20,
			disabled: false,
		},
		{
			name: 'stays enabled when `currentPostId` is undefined',
			data: { type: 'my-component', isCurrent: true, postId: 10 },
			disabled: false,
		},
		{
			name: 'is disabled once the user replies after it',
			data: { type: 'my-component', isCurrent: true },
			laterMessages: [ createMessage( { id: 'user-1', role: 'user' } ) ],
			disabled: true,
		},
		{
			name: 'stays enabled when only agent messages follow it',
			data: { type: 'my-component', isCurrent: true },
			laterMessages: [
				createMessage( {
					id: 'agent-1',
					content: [ { type: 'text', text: 'Anything else?' } ],
				} ),
			],
			disabled: false,
		},
		{
			name: 'stays enabled when only a context-only user message follows it',
			data: { type: 'my-component', isCurrent: true },
			laterMessages: [
				createMessage( {
					id: 'context-1',
					role: 'user',
					content: [ { type: 'context', text: 'hidden continuation' } ],
				} ),
			],
			disabled: false,
		},
	];

	it.each( stalenessCases )(
		'the picker $name',
		( { data, currentPostId, laterMessages = [], disabled } ) => {
			const getChatComponent = jest.fn().mockReturnValue( MockComponent );

			const result = convertToolMessagesToComponents( {
				messages: [
					createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, data, { id: 'tool-1' } ),
					...laterMessages,
				],
				getChatComponent,
				currentPostId,
			} );

			expect( result[ 0 ] ).toMatchObject( { disabled } );
			expect( result[ 0 ].content[ 0 ] ).toMatchObject( { component: MockComponent } );
			const componentProps = (
				result[ 0 ].content[ 0 ] as {
					componentProps?: {
						isMessageStale?: boolean;
						onResponseAction?: typeof mockResponseAction;
					};
				}
			 ).componentProps;
			expect( componentProps?.isMessageStale === true ).toBe( disabled );
			expect( componentProps?.onResponseAction ).toBe( disabled ? undefined : mockResponseAction );
			expect(
				result[ 0 ].content.some(
					( content ) =>
						content.type === 'component' && content.component === ChatResponseRenderedTracker
				)
			).toBe( ! disabled );
		}
	);

	it( 'replaces a provider-supplied action callback with the host callback', () => {
		const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			props: { onResponseAction: 'untrusted-value' },
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result[ 0 ].content[ 0 ].componentProps.onResponseAction ).toBe( mockResponseAction );
	} );

	it( 'removes a provider-supplied action callback from stale responses', () => {
		const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			props: { onResponseAction: 'untrusted-value' },
			isCurrent: false,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result[ 0 ].content[ 0 ].componentProps.onResponseAction ).toBeUndefined();
	} );

	describe( 'AM-owned components', () => {
		// The AM components are lazy wrappers, so the assertion renders the
		// resolved component and waits for the picker chunk to arrive.
		it.each( [
			[ 'button-picker', ButtonPicker ],
			[ 'color-picker', ColorPicker ],
			[ 'font-picker', FontPicker ],
		] )( 'resolves %s to its AM component', async ( type, picker ) => {
			const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
				type,
				props: { variations: [] },
				isCurrent: true,
			} );

			const result = convertToolMessagesToComponents( {
				messages: [ message ],
			} );

			const content = result[ 0 ].content[ 0 ] as {
				type: string;
				component: React.ComponentType;
			};
			expect( content.type ).toBe( 'component' );

			render( createElement( content.component ) );
			await waitFor( () => expect( picker ).toHaveBeenCalled() );
		} );

		it( 'passes props without `contentType`', () => {
			const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
				type: 'color-picker',
				props: { variations: [ { title: 'Bold' } ] },
				isCurrent: true,
			} );

			const result = convertToolMessagesToComponents( {
				messages: [ message ],
			} );

			expect( result[ 0 ].content[ 0 ].componentProps ).toEqual( {
				variations: [ { title: 'Bold' } ],
			} );
		} );

		it( 'renders the stored summary for deprecated component types', () => {
			const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
				type: 'pattern-picker',
				props: { layouts: [] },
				summary: 'Here are some layouts to choose from.',
				isCurrent: true,
			} );

			const result = convertToolMessagesToComponents( {
				messages: [ message ],
			} );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].content ).toEqual( [
				{ type: 'text', text: 'Here are some layouts to choose from.' },
			] );
			expect( result[ 0 ].suppressThinking ).toBe( true );
		} );

		it( 'renders a short notice for deprecated component types without a summary', () => {
			const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
				type: 'unknown',
				props: {},
				isCurrent: true,
			} );

			const result = convertToolMessagesToComponents( {
				messages: [ message ],
			} );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].content ).toEqual( [
				{ type: 'text', text: 'This option is no longer available.' },
			] );
		} );

		it( 'does not call `getChatComponent`', () => {
			const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
				type: 'color-picker',
				props: { variations: [] },
				isCurrent: true,
			} );
			const getChatComponent = jest.fn().mockReturnValue( jest.fn() );

			convertToolMessagesToComponents( {
				messages: [ message ],
				getChatComponent,
			} );

			expect( getChatComponent ).not.toHaveBeenCalled();
		} );
	} );
} );
