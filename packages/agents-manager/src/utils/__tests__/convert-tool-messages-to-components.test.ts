import { EscalationButton } from '../../components/escalation-button';
import NextStepButton from '../../components/next-step-button';
import UnavailableToolMessage from '../../components/unavailable-tool-message';
import convertToolMessagesToComponents from '../convert-tool-messages-to-components';
import { isEditorPage } from '../is-editor-page';
import {
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
} from '../show-component-tools';
import type { UIMessage } from '@automattic/agenttic-client';

jest.mock(
	'@automattic/components',
	() => ( {
		SummaryButton: () => null,
		FoldableCard: () => null,
	} ),
	{ virtual: true }
);
jest.mock( '../is-editor-page' );

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

	it( 'renders tool messages as components', () => {
		const message = createToolMessage( SHOW_COMPONENT_TOOL_ID, {
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

	it( 'appends `NextStepButton` with `onSubmit` as `onMoveToNextStep` only to the last active message with follow-up tasks', () => {
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

		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].id ).toBe( 'msg-1' );
		expect( result[ 1 ].id ).toBe( 'msg-2' );
		expect( result[ 2 ].id ).toBe( 'msg-2-next-step' );
		expect( result[ 2 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: NextStepButton,
			componentProps: { onMoveToNextStep: mockOnSubmit },
		} );
		expect( result[ 2 ].actions ).toBeUndefined();
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
			component: EscalationButton,
		} );
	} );

	it( 'filters out unhandled tool messages', () => {
		const result = convertWithDefaults( {
			messages: [ createToolMessage( 'other_tool' ) ],
		} );

		expect( result ).toEqual( [] );
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
