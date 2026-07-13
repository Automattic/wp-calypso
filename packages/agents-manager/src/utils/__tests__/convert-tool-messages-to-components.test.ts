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
const mockOnSubmit = jest.fn();
const SHOW_COMPONENT_TOOL_ID = JETPACK_AI_SHOW_COMPONENT_TOOL_ID;
const LEGACY_SHOW_COMPONENT_TOOL_ID = BIG_SKY_SHOW_COMPONENT_TOOL_ID;

const convertWithDefaults = (
	options: Omit< Parameters< typeof convertToolMessagesToComponents >[ 0 ], 'onSubmit' >
) => convertToolMessagesToComponents( { ...options, onSubmit: mockOnSubmit } );

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

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'passes through plain-text agent messages unchanged', () => {
		const message = createMessage( {
			content: [ { type: 'text', text: 'Hello, how can I help?' } ],
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'filters out context-only messages', () => {
		const message = createMessage( {
			content: [ { type: 'text', text: 'This is only context for the model.' } ],
			context: { flags: { context_only: true } },
		} as Partial< UIMessage > );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'filters out messages transformed to context content', () => {
		const message = createMessage( {
			content: [ { type: 'context', text: 'This is only context for the model.' } ],
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'filters out messages with context-only data flags', () => {
		const message = createMessage( {
			content: [
				{ type: 'text', text: 'This is only context for the model.' },
				{ type: 'data', data: { flags: { context_only: true } } },
			],
		} );

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

	it( 'does not suppress the thinking indicator for component messages with follow-up tasks', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'does not append a move-to-next-step button for active messages with follow-up tasks', () => {
		const data = { type: 'my-component', followUpTasks: true, isCurrent: true };
		const actions = [
			{ id: 'action-1', label: 'Do something', onClick: jest.fn() },
		] as UIMessage[ 'actions' ];
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: UnavailableToolMessage,
			componentProps: { type: 'start-over' },
		} );
	} );

	it( 'renders support tool data as plain text', () => {
		const supportText = 'Here is some help for your domain question.';
		const message = createToolMessage( 'big_sky__wordpress_com_support', supportText );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: supportText,
		} );
	} );

	it( 'renders apply-block-edits tool summary as plain text', () => {
		const summaryText = 'Updated the heading and added a new paragraph.';
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			summary: summaryText,
			calypsoCheckpointId: 'checkpoint-1',
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: summaryText,
		} );
	} );

	it( 'renders apply-block-edits structured result message as plain text', () => {
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			result: {
				success: true,
				message: 'Updated the header and footer.',
				details: {
					changes: { added: [], removed: [], modified: [] },
				},
			},
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: 'Updated the header and footer.',
		} );
	} );

	it( 'filters out unsuccessful apply-block-edits tool summaries', () => {
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			success: false,
			summary: 'Tried to update the header, but it did not stick.',
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'renders stream-page-design tool summary as plain text', () => {
		const summaryText = 'A bold hero with three airy feature sections in the theme accent colors.';
		const message = createToolMessage( 'big_sky__stream_page_design', {
			summary: summaryText,
			isCurrent: true,
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: summaryText,
		} );
	} );

	it( 'renders stream-page-design structured result message as plain text', () => {
		const message = createToolMessage( 'big_sky__stream_page_design', {
			result: {
				success: true,
				message: 'The generated page content has been staged in the editor for review.',
			},
			returnToAgent: true,
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: 'The generated page content has been staged in the editor for review.',
		} );
	} );

	it( 'suppresses transient thinking for converted apply-block-edits messages', () => {
		const message = createToolMessage( 'big_sky__apply_block_edits', {
			followUpTasks: true,
			summary: 'Updated the header and footer.',
		} );

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

	it( 'renders update-theme structured result message as plain text', () => {
		const message = createToolMessage( 'big_sky__apply_update_theme', {
			result: {
				success: true,
				message: 'Updated the color palette.',
			},
		} );

		const result = convertWithDefaults( {
			messages: [ message ],
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: 'Updated the color palette.',
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

		const result = convertWithDefaults( {
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
		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
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

		const result = convertWithDefaults( {
			messages: [ toolMessage, userMessage, prose ],
			getChatComponent,
		} );

		// A user message sits between the tool and the prose, so the prose
		// isn't adjacent and shouldn't be dropped.
		expect( result ).toHaveLength( 3 );
		expect( result.map( ( m ) => m.id ) ).toEqual( [ 'tool-1', 'user-1', 'prose-1' ] );
	} );

	it( 'disables component when `isCurrent` is false', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			isCurrent: false,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: true } );
	} );

	it( 'does not append `NextStepButton` when `isCurrent` is false', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: false,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			component: MockComponent,
		} );
	} );

	it( 'disables component when `postId` differs from `currentPostId`', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: true } );
	} );

	it( 'does not append `NextStepButton` when `postId` differs from `currentPostId`', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			component: MockComponent,
		} );
	} );

	it( 'does not disable component when `postId` matches `currentPostId`', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 10,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );

	it( 'does not disable component when `postId` is missing from the tool message', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );

	it( 'does not disable component when `currentPostId` is undefined', () => {
		const message = createToolMessage( LEGACY_SHOW_COMPONENT_TOOL_ID, {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertWithDefaults( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );
} );
