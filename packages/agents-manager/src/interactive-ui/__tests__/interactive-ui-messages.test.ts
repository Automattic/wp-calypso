import {
	getInteractiveUiBatches,
	getInteractiveUiMessagesFromText,
} from '../interactive-ui-messages';
import type { UIMessage } from '@automattic/agenttic-client';

const operations = [
	{
		version: 'v0.9',
		createSurface: {
			surfaceId: 'test-form',
			catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
		},
	},
	{
		version: 'v0.9',
		updateComponents: {
			surfaceId: 'test-form',
			components: [ { id: 'root', component: 'Text', text: 'Test form' } ],
		},
	},
];

const envelope = JSON.stringify( {
	tool_id: 'wpcom__render_interactive_ui',
	data: operations,
} );

describe( 'interactive UI response messages', () => {
	it( 'extracts ordered surface operations from the renamed tool envelope', () => {
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

	it( 'leaves unrelated tool responses as ordinary message content', () => {
		expect(
			getInteractiveUiMessagesFromText(
				JSON.stringify( { tool_id: 'wpcom__other_tool', data: operations } )
			)
		).toBeUndefined();
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
					{ type: 'text', text: 'Here is the form.' },
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
