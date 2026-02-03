import { convertToolMessagesToComponents } from '../convert-tool-message-to-component';
import type { UIMessage } from '@automattic/agenttic-client';

const MockComponent = jest.fn();
const MockNextStepButton = jest.fn();

const createMessage = ( overrides: Partial< UIMessage > = {} ): UIMessage =>
	( {
		id: 'msg-1',
		role: 'agent',
		content: [ { type: 'text', text: 'Hello' } ],
		...overrides,
	} ) as UIMessage;

describe( 'convertToolMessagesToComponents', () => {
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
		const message = createMessage( {
			content: [
				{
					type: 'text',
					text: JSON.stringify( {
						tool_id: 'big_sky__show_component',
						data: { type: 'my-component', props: { name: 'test' } },
					} ),
				},
			],
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
		const message = createMessage( {
			content: [
				{
					type: 'text',
					text: JSON.stringify( {
						tool_id: 'big_sky__show_component',
						data: { type: 'unknown-component' },
					} ),
				},
			],
		} );
		const getChatComponent = jest.fn().mockReturnValue( null );

		const result = convertToolMessagesToComponents( { messages: [ message ], getChatComponent } );

		expect( result ).toEqual( [] );
	} );

	it( 'appends next-step-button only to the last message with follow-up tasks', () => {
		const toolMessage = ( id: string ) =>
			createMessage( {
				id,
				content: [
					{
						type: 'text',
						text: JSON.stringify( {
							tool_id: 'big_sky__show_component',
							data: { type: 'my-component', followUpTasks: true },
						} ),
					},
				],
			} );
		const getChatComponent = jest.fn( ( type: string ) =>
			type === 'my-component' ? MockComponent : MockNextStepButton
		);

		const result = convertToolMessagesToComponents( {
			messages: [ toolMessage( 'msg-1' ), toolMessage( 'msg-2' ) ],
			getChatComponent,
		} );

		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].id ).toBe( 'msg-1' );
		expect( result[ 1 ].id ).toBe( 'msg-2' );
		expect( result[ 2 ].id ).toBe( 'msg-2-next-step' );
	} );

	it( 'filters out unhandled tool messages', () => {
		const message = createMessage( {
			content: [
				{
					type: 'text',
					text: JSON.stringify( { tool_id: 'other_tool' } ),
				},
			],
		} );

		const result = convertToolMessagesToComponents( { messages: [ message ] } );

		expect( result ).toEqual( [] );
	} );
} );
