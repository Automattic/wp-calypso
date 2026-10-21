import {
	getInteractiveUiBatches,
	getInteractiveUiMessagesFromText,
} from '../interactive-ui-messages';
import type { UIMessage } from '@automattic/agenttic-client';

const operations = [
	{
		version: 'v0.9',
		createSurface: {
			surfaceId: 'test-surface',
			catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
		},
	},
	{
		version: 'v0.9',
		updateComponents: {
			surfaceId: 'test-surface',
			components: [ { id: 'root', component: 'Text', text: 'Test surface' } ],
		},
	},
];

const envelope = JSON.stringify( {
	tool_id: 'wpcom__render_interactive_ui',
	data: operations,
} );

describe( 'interactive UI response messages', () => {
	it( 'extracts ordered surface operations from the tool envelope', () => {
		expect( getInteractiveUiMessagesFromText( envelope ) ).toEqual( operations );
	} );

	it( 'accepts stringified envelope data', () => {
		expect(
			getInteractiveUiMessagesFromText(
				JSON.stringify( {
					tool_id: 'wpcom__render_interactive_ui',
					data: JSON.stringify( operations ),
				} )
			)
		).toEqual( operations );
	} );

	it( 'accepts raw protocol message arrays', () => {
		expect( getInteractiveUiMessagesFromText( JSON.stringify( operations ) ) ).toEqual(
			operations
		);
	} );

	it.each( [
		[ 'plain text', 'Here you go.' ],
		[
			'an unrelated tool response',
			JSON.stringify( { tool_id: 'wpcom__other_tool', data: operations } ),
		],
		[ 'another protocol version', JSON.stringify( [ { ...operations[ 0 ], version: 'v0.8' } ] ) ],
	] )( 'ignores %s', ( _description, text ) => {
		expect( getInteractiveUiMessagesFromText( text ) ).toBeUndefined();
	} );

	it( 'associates only agent response operations with their message', () => {
		const messages: UIMessage[] = [
			{
				id: 'user',
				role: 'user',
				content: [ { type: 'text', text: envelope } ],
				timestamp: 0,
				archived: false,
				showIcon: false,
			},
			{
				id: 'agent',
				role: 'agent',
				content: [
					{ type: 'text', text: 'Here you go.' },
					{ type: 'text', text: envelope },
				],
				timestamp: 1,
				archived: false,
				showIcon: true,
			},
		];

		expect( getInteractiveUiBatches( messages ) ).toEqual( [
			{ messageId: 'agent', operations, signature: JSON.stringify( [ 'agent', 1, envelope ] ) },
		] );
	} );
} );
