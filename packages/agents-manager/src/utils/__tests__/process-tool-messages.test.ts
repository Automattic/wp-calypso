import { EscalationButton } from '../../components/escalation-button';
import UnavailableToolMessage from '../../components/unavailable-tool-message';
import { isEditorPage } from '../is-editor-page';
import {
	convertToolMessagesToComponents,
	disablePickersAndRemoveNextButton,
} from '../process-tool-messages';
import type { UIMessage } from '@automattic/agenttic-client';

jest.mock( '@automattic/components', () => ( {
	SummaryButton: () => null,
} ) );
jest.mock( '../is-editor-page' );

const MockComponent = jest.fn();
const MockNextStepButton = jest.fn();

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

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'passes through plain-text agent messages unchanged', () => {
		const message = createMessage( {
			content: [ { type: 'text', text: 'Hello, how can I help?' } ],
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'converts tool messages to components', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			props: { name: 'test' },
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( { messages: [ message ], getChatComponent } );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: MockComponent,
			componentProps: { name: 'test', contentType: 'my-component' },
		} );
	} );

	it( 'filters out unregistered components', () => {
		const message = createToolMessage( 'big_sky__show_component', { type: 'unknown-component' } );
		const getChatComponent = jest.fn().mockReturnValue( null );

		const result = convertToolMessagesToComponents( { messages: [ message ], getChatComponent } );

		expect( result ).toEqual( [] );
	} );

	it( 'appends `next-step-button` only to the last message with follow-up tasks', () => {
		const data = { type: 'my-component', followUpTasks: true, isCurrent: true };
		const getChatComponent = jest.fn( ( type: string ) =>
			type === 'my-component' ? MockComponent : MockNextStepButton
		);

		const result = convertToolMessagesToComponents( {
			messages: [
				createToolMessage( 'big_sky__show_component', data, { id: 'msg-1' } ),
				createToolMessage( 'big_sky__show_component', data, { id: 'msg-2' } ),
			],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].id ).toBe( 'msg-1' );
		expect( result[ 1 ].id ).toBe( 'msg-2' );
		expect( result[ 2 ].id ).toBe( 'msg-2-next-step' );
	} );

	it( 'shows `UnavailableToolMessage` when not on an editor page', () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );
		const message = createToolMessage( 'big_sky__show_component', { type: 'my-component' } );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: UnavailableToolMessage,
			componentProps: { type: 'picker' },
		} );
	} );

	it( 'shows `UnavailableToolMessage` for the start-over tool', () => {
		const message = createToolMessage( 'big_sky__client_assistants', {
			assistantId: 'big-sky-site-admin',
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

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

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'text',
			text: supportText,
		} );
	} );

	it( 'returns `EscalationButton` when `forward_to_human_support` flag is set', () => {
		const message = createMessage( {
			content: [
				{ type: 'text', text: 'Hello' },
				{
					type: 'data',
					data: { flags: { forward_to_human_support: true } },
				},
			],
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			type: 'component',
			component: EscalationButton,
		} );
	} );

	it( 'filters out unhandled tool messages', () => {
		const result = convertToolMessagesToComponents( {
			messages: [ createToolMessage( 'other_tool' ) ],
		} );

		expect( result ).toEqual( [] );
	} );

	it( 'disables component messages when `isCurrent` is `false`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			isCurrent: false,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: true } );
	} );

	it( 'hides `next-step-button` when `isCurrent` is `false`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: false,
		} );
		const getChatComponent = jest.fn( ( type: string ) =>
			type === 'my-component' ? MockComponent : MockNextStepButton
		);

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			component: MockComponent,
		} );
	} );

	it( 'disables component when `postId` differs from `currentPostId`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: true } );
	} );

	it( 'hides `next-step-button` when `postId` differs from `currentPostId`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			followUpTasks: true,
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn( ( type: string ) =>
			type === 'my-component' ? MockComponent : MockNextStepButton
		);

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content[ 0 ] ).toMatchObject( {
			component: MockComponent,
		} );
	} );

	it( 'does not disable when `postId` matches `currentPostId`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 10,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );

	it( 'does not disable when `postId` is missing from the tool message', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			isCurrent: true,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
			currentPostId: 20,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );

	it( 'does not disable when `currentPostId` is `undefined`', () => {
		const message = createToolMessage( 'big_sky__show_component', {
			type: 'my-component',
			isCurrent: true,
			postId: 10,
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( {
			messages: [ message ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: false } );
	} );
} );

describe( 'disablePickersAndRemoveNextButton', () => {
	it( 'disables messages with `isShowComponentMessage`', () => {
		const message = { ...createMessage(), isShowComponentMessage: true } as UIMessage;

		const result = disablePickersAndRemoveNextButton( [ message ] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( { disabled: true } );
	} );

	it( 'removes messages with `isNextStepButton`', () => {
		const message = { ...createMessage(), isNextStepButton: true } as UIMessage;

		const result = disablePickersAndRemoveNextButton( [ message ] );

		expect( result ).toHaveLength( 0 );
	} );

	it( 'passes through regular messages unchanged', () => {
		const message = createMessage();

		const result = disablePickersAndRemoveNextButton( [ message ] );

		expect( result ).toEqual( [ message ] );
	} );

	it( 'handles a mix of message types', () => {
		const regular = createMessage( { id: 'regular' } );
		const component = {
			...createMessage( { id: 'component' } ),
			isShowComponentMessage: true,
		} as UIMessage;
		const nextStep = {
			...createMessage( { id: 'next-step' } ),
			isNextStepButton: true,
		} as UIMessage;

		const result = disablePickersAndRemoveNextButton( [ regular, component, nextStep ] );

		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ].id ).toBe( 'regular' );
		expect( result[ 1 ].id ).toBe( 'component' );
		expect( result[ 1 ] ).toMatchObject( { disabled: true } );
	} );
} );
