/* eslint-disable import/order -- mocks must be registered before importing the converter */
function mockEscalationButton() {
	return null;
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
jest.mock( '../is-editor-page' );

import UnavailableToolMessage from '../../components/unavailable-tool-message';
import convertToolMessagesToComponents from '../convert-tool-messages-to-components';
import { isEditorPage } from '../is-editor-page';
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

describe( 'convertToolMessagesToComponents', () => {
	beforeEach( () => {
		( isEditorPage as jest.Mock ).mockReturnValue( true );
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
		const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			props: { name: 'test' },
			summary: 'Choose one of these options.',
			isCurrent: true,
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
			},
		} );
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

		expect( result[ 0 ].content ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( { type: 'component' } );
		expect( result[ 0 ].content[ 0 ].componentProps.summary ).toBeUndefined();
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

	it( 'filters out unregistered components', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'unknown-component',
		} );
		const getChatComponent = jest.fn().mockReturnValue( null );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toEqual( [] );
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
	} );

	it( 'renders `UnavailableToolMessage` when not on an editor page', () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, { type: 'my-component' } );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: UnavailableToolMessage,
			componentProps: { type: 'picker' },
		} );
	} );

	it( 'renders `UnavailableToolMessage` for the start-over tool', () => {
		const message = createToolMessage( 'big_sky__client_assistants', {
			assistantId: 'big-sky-site-admin',
		} );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: UnavailableToolMessage,
			componentProps: { type: 'start-over' },
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
			name: 'apply-block-edits structured result',
			toolId: 'big_sky__apply_block_edits',
			data: {
				result: {
					success: true,
					message: 'Updated the header and footer.',
					details: {
						changes: { added: [], removed: [], modified: [] },
					},
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
			summary: 'Updated the header and footer.',
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
			{ result: { success: true, message: 'Updated the header.' } },
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
		}
	);
} );
