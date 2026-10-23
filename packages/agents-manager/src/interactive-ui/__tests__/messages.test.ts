import { createInteractiveUiCatalog, createInteractiveUiRuntime } from '@automattic/ai-ui-renderer';
import {
	applyInteractiveUiBatch,
	getInteractiveUiBatches,
	getStaleInteractiveUiSurfaceIds,
	readInteractiveUiPart,
} from '../messages';
import type { InteractiveUiBatch } from '../messages';
import type { UIMessage } from '@automattic/agenttic-client';

const operations = [
	{
		version: 'v1.0' as const,
		createSurface: {
			surfaceId: 'test-surface',
			catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
		},
	},
	{
		version: 'v1.0' as const,
		updateComponents: {
			surfaceId: 'test-surface',
			components: [ { id: 'root', component: 'Text', text: 'Test surface' } ],
		},
	},
];

const part = {
	type: 'data' as const,
	data: operations,
	metadata: { mimeType: 'application/a2ui+json' as const },
};

// Agenttic keeps A2UI's A2A data part under `a2ui`.
const surfaceContent = { type: 'data' as const, data: { a2ui: part } };

describe( 'interactive UI response messages', () => {
	it( 'reads the A2UI messages, and the page they were built for, from the A2UI data part', () => {
		const pagePart = { ...part, metadata: { ...part.metadata, postId: 7 } };

		expect( readInteractiveUiPart( surfaceContent ) ).toEqual( { operations } );
		expect( readInteractiveUiPart( { type: 'data', data: { a2ui: pagePart } } ) ).toEqual( {
			operations,
			postId: 7,
		} );
	} );

	it.each( [
		[
			'the old text envelope',
			{
				type: 'text' as const,
				text: JSON.stringify( { tool_id: 'wpcom__render_interactive_ui', data: operations } ),
			},
		],
		[
			'another data part',
			{ type: 'data' as const, data: { sources: [ 'https://example.com' ] } },
		],
	] )( 'ignores %s', ( _description, content ) => {
		expect( readInteractiveUiPart( content ) ).toBeUndefined();
	} );

	it( 'associates only agent response operations with their message', () => {
		const messages: UIMessage[] = [
			{
				id: 'user',
				role: 'user',
				content: [ surfaceContent ],
				timestamp: 0,
				archived: false,
				showIcon: false,
			},
			{
				id: 'agent',
				role: 'agent',
				content: [ { type: 'text', text: 'Here you go.' }, surfaceContent ],
				timestamp: 1,
				archived: false,
				showIcon: true,
			},
		];

		expect( getInteractiveUiBatches( messages ) ).toEqual( [
			{
				operations,
				messageId: 'agent',
				messageIndex: 1,
				signature: JSON.stringify( [ 'agent', { operations } ] ),
			},
		] );
	} );
} );

describe( 'getStaleInteractiveUiSurfaceIds', () => {
	function createBatch( messageIndex: number, postId?: number ): InteractiveUiBatch {
		return {
			operations,
			messageId: `agent-${ messageIndex }`,
			messageIndex,
			signature: String( messageIndex ),
			...( postId && { postId } ),
		};
	}

	it.each( [
		[
			'the user has replied past it',
			createBatch( 1 ),
			{ latestUserMessageIndex: 2, restoredSignatures: new Set< string >() },
		],
		[
			'the editor has another page open',
			createBatch( 1, 7 ),
			{ latestUserMessageIndex: 0, restoredSignatures: new Set< string >(), currentPostId: 8 },
		],
		[
			'it was restored from history',
			createBatch( 1 ),
			{ latestUserMessageIndex: 0, restoredSignatures: new Set( [ '1' ] ) },
		],
	] )( 'marks a surface stale when %s', ( _description, batch, options ) => {
		expect( getStaleInteractiveUiSurfaceIds( [ batch ], options ) ).toEqual(
			new Set( [ 'test-surface' ] )
		);
	} );

	it( 'skips malformed operations', () => {
		const batch = {
			...createBatch( 1 ),
			operations: [ ...operations, null ] as unknown as InteractiveUiBatch[ 'operations' ],
		};

		expect(
			getStaleInteractiveUiSurfaceIds( [ batch ], {
				latestUserMessageIndex: 2,
				restoredSignatures: new Set< string >(),
			} )
		).toEqual( new Set( [ 'test-surface' ] ) );
	} );

	it( 'keeps a surface’s page when a later update doesn’t name one', () => {
		const update = { ...createBatch( 2 ), operations: [ operations[ 1 ] ] };

		expect(
			getStaleInteractiveUiSurfaceIds( [ createBatch( 1, 7 ), update ], {
				latestUserMessageIndex: 0,
				restoredSignatures: new Set< string >(),
				currentPostId: 8,
			} )
		).toEqual( new Set( [ 'test-surface' ] ) );
	} );

	it( 'judges a surface by the last batch that changed it', () => {
		const staleSurfaceIds = getStaleInteractiveUiSurfaceIds(
			[ createBatch( 1 ), createBatch( 3 ) ],
			{ latestUserMessageIndex: 2, restoredSignatures: new Set< string >() }
		);

		expect( staleSurfaceIds.size ).toBe( 0 );
	} );
} );

describe( 'applyInteractiveUiBatch', () => {
	it( 'keeps only the messages the runtime accepts', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const runtime = createInteractiveUiRuntime( {
			catalogs: [ createInteractiveUiCatalog() ],
			onAction: jest.fn(),
			onError: jest.fn(),
		} );
		const rejected = {
			version: 'v1.0' as const,
			updateComponents: { surfaceId: 'missing-surface', components: [ { id: 'root' } ] },
		};

		const applied = applyInteractiveUiBatch( runtime, {
			operations: [ rejected, ...operations ],
			messageId: 'agent',
			messageIndex: 1,
			signature: '1',
		} );

		expect( applied.operations ).toEqual( operations );
		expect( consoleError ).toHaveBeenCalledTimes( 1 );

		consoleError.mockRestore();
	} );
} );
