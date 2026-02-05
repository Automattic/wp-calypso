import UnavailableToolMessage from '../../components/unavailable-tool-message';
import { convertToolMessagesToComponents } from '../convert-tool-message-to-component';
import { isEditorPage } from '../is-editor-page';
import type { UIMessage } from '@automattic/agenttic-client';

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
	data?: object,
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

	it( 'passes through agent messages with plain text unchanged', () => {
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
		} );
		const getChatComponent = jest.fn().mockReturnValue( MockComponent );

		const result = convertToolMessagesToComponents( { messages: [ message ], getChatComponent } );

		expect( getChatComponent ).toHaveBeenCalledWith( 'my-component' );
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

	it( 'appends next-step-button only to the last message with follow-up tasks', () => {
		const data = { type: 'my-component', followUpTasks: true };
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

	it( 'shows unavailable tool message when not on editor page', () => {
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

	it( 'shows unavailable tool message for start over tool', () => {
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

	it( 'filters out unhandled tool messages', () => {
		const result = convertToolMessagesToComponents( {
			messages: [ createToolMessage( 'other_tool' ) ],
		} );

		expect( result ).toEqual( [] );
	} );
} );
