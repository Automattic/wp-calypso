import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import {
	applyInteractiveUiBatch,
	getRejectedInteractiveUiMessageIds,
	getUsableInteractiveUiSurfaceIds,
	getInteractiveUiBatches,
	getStaleInteractiveUiSurfaceIds,
	keepInteractiveUiSurfacesInTranscript,
	readInteractiveUiPart,
} from '../messages';
import { createBatch, createRuntime, operations } from './fixtures/surface';
import type { InteractiveUiBatch } from '../messages';
import type { UIMessage } from '@automattic/agenttic-client';

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
				signature: JSON.stringify( [ 'agent', { operations } ] ),
			},
		] );
	} );
} );

describe( 'getStaleInteractiveUiSurfaceIds', () => {
	const pageBatch = ( postId: number ) => ( { ...createBatch( operations, 'agent' ), postId } );
	const options = {
		messageIndexes: new Map( [ [ 'agent', 1 ] ] ),
		latestUserMessageIndex: 0,
		restoredMessageIds: new Set< string >(),
	};

	it.each( [
		[
			'the user has replied past it',
			createBatch( operations, 'agent' ),
			{ ...options, latestUserMessageIndex: 2 },
		],
		[ 'the editor has another page open', pageBatch( 7 ), { ...options, currentPostId: 8 } ],
		[
			'it was restored from history',
			createBatch( operations, 'agent' ),
			{ ...options, restoredMessageIds: new Set( [ 'agent' ] ) },
		],
		[
			'its message has left the transcript',
			createBatch( operations, 'agent' ),
			{ ...options, messageIndexes: new Map() },
		],
	] )( 'marks a surface stale when %s', ( _description, batch, staleOptions ) => {
		expect( getStaleInteractiveUiSurfaceIds( [ batch ], staleOptions ) ).toEqual(
			new Set( [ 'test-surface' ] )
		);
	} );

	it( 'skips malformed operations', () => {
		const batch = {
			...createBatch( operations, 'agent' ),
			operations: [ ...operations, null ] as unknown as InteractiveUiBatch[ 'operations' ],
		};

		expect(
			getStaleInteractiveUiSurfaceIds( [ batch ], { ...options, latestUserMessageIndex: 2 } )
		).toEqual( new Set( [ 'test-surface' ] ) );
	} );

	it( 'keeps a surface’s page when a later update doesn’t name one', () => {
		const update = createBatch( [ operations[ 1 ] ], 'update' );

		expect(
			getStaleInteractiveUiSurfaceIds( [ pageBatch( 7 ), update ], {
				...options,
				messageIndexes: new Map( [
					[ 'agent', 1 ],
					[ 'update', 2 ],
				] ),
				currentPostId: 8,
			} )
		).toEqual( new Set( [ 'test-surface' ] ) );
	} );

	it( 'judges a surface by the last batch that changed it', () => {
		const update = createBatch( [ operations[ 1 ] ], 'update' );

		const staleSurfaceIds = getStaleInteractiveUiSurfaceIds(
			[ createBatch( operations, 'agent' ), update ],
			{
				...options,
				messageIndexes: new Map( [
					[ 'agent', 1 ],
					[ 'update', 3 ],
				] ),
				latestUserMessageIndex: 2,
			}
		);

		expect( staleSurfaceIds.size ).toBe( 0 );
	} );
} );

describe( 'applyInteractiveUiBatch', () => {
	const rejected = {
		version: 'v1.0' as const,
		updateComponents: { surfaceId: 'missing-surface', components: [ { id: 'root' } ] },
	};

	it.each( [
		[ 'marks a batch with a rejected message', [ rejected, ...operations ], true ],
		[ 'leaves a fully applied batch unmarked', operations, false ],
	] )( '%s and keeps only its applied messages', ( _, batchOperations, hasRejections ) => {
		expect(
			applyInteractiveUiBatch( createRuntime(), createBatch( batchOperations, 'agent' ) )
		).toMatchObject( { operations, hasRejections } );
	} );
} );

describe( 'getRejectedInteractiveUiMessageIds', () => {
	it( 'gives the live messages with rejected A2UI messages, not restored ones', () => {
		const batches = [
			{ ...createBatch( operations, 'live' ), hasRejections: true },
			{ ...createBatch( operations, 'applied' ), hasRejections: false },
			{ ...createBatch( operations, 'restored' ), hasRejections: true },
		];

		expect( getRejectedInteractiveUiMessageIds( batches, new Set( [ 'restored' ] ) ) ).toEqual(
			new Set( [ 'live' ] )
		);
	} );
} );

describe( 'getUsableInteractiveUiSurfaceIds', () => {
	const surfaceOperations = ( surfaceId: string, text: unknown ) => [
		{ version: 'v1.0' as const, createSurface: { surfaceId, catalogId: BASIC_CATALOG_ID } },
		{
			version: 'v1.0' as const,
			updateComponents: { surfaceId, components: [ { id: 'root', component: 'Text', text } ] },
		},
	];

	it( 'gives each surface of the batches once, leaving out stale ones', () => {
		const runtime = createRuntime();
		const batches = [ createBatch( operations, 'agent' ), createBatch( [], 'agent' ) ];

		runtime.processMessages(
			[ ...surfaceOperations( 'form', 'Form' ), ...surfaceOperations( 'picker', 'Picker' ) ],
			'agent'
		);

		expect( getUsableInteractiveUiSurfaceIds( runtime, batches, new Set( [ 'picker' ] ) ) ).toEqual(
			[ 'form' ]
		);
	} );

	it( 'leaves out a surface whose components were rejected, as it never shows', () => {
		const runtime = createRuntime();

		runtime.processMessages( surfaceOperations( 'form', 5 ), 'agent' );

		expect( runtime.getSurfaceIds( 'agent' ) ).toEqual( [ 'form' ] );
		expect(
			getUsableInteractiveUiSurfaceIds( runtime, [ createBatch( [], 'agent' ) ], new Set() )
		).toEqual( [] );
	} );
} );

describe( 'keepInteractiveUiSurfacesInTranscript', () => {
	it( 'leaves out a surface that a message which left the transcript changed', () => {
		const batches = [
			createBatch(
				[
					{
						version: 'v1.0',
						createSurface: { surfaceId: 'form', catalogId: BASIC_CATALOG_ID, sendDataModel: true },
					},
				],
				'agent-1'
			),
			createBatch(
				[
					{
						version: 'v1.0',
						updateDataModel: { surfaceId: 'form', path: '/', value: { name: 'Ada' } },
					},
				],
				'agent-2'
			),
		];

		expect(
			keepInteractiveUiSurfacesInTranscript( [ 'form' ], batches, new Map( [ [ 'agent-1', 0 ] ] ) )
		).toEqual( [] );
	} );
} );
