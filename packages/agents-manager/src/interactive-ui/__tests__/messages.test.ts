import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import {
	applyInteractiveUiBatch,
	getRejectedInteractiveUiMessageIds,
	getUsableInteractiveUiSurfaceIds,
	getInteractiveUiBatches,
	getStaleInteractiveUiSurfaceIds,
	keepInteractiveUiSurfacesInTranscript,
	readInteractiveUiActionMessage,
	readInteractiveUiPart,
} from '../messages';
import {
	createBatch,
	createRuntime,
	formOperations,
	operations,
	surfaceContent,
	surfacePart,
} from './fixtures/surface';
import type { InteractiveUiBatch } from '../messages';
import type { UIMessage } from '@automattic/agenttic-client';

describe( 'interactive UI response messages', () => {
	it( 'reads the A2UI messages, and the page they were built for, from the A2UI data part', () => {
		const pagePart = { ...surfacePart, metadata: { ...surfacePart.metadata, postId: 7 } };

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

describe( 'readInteractiveUiActionMessage', () => {
	function createContextMessage( text: string ): UIMessage {
		return {
			id: 'context',
			role: 'user',
			content: [ { type: 'context', text } ],
			timestamp: 0,
			archived: false,
			showIcon: false,
		};
	}

	it.each( [
		[ 'no `userMessage`', { name: 'greet' } ],
		[ 'a blank `userMessage`', { name: 'greet', userMessage: '  ' } ],
	] )( 'reads an action with %s as one without a note', ( _description, action ) => {
		const message = createContextMessage( JSON.stringify( { version: 'v1.0', action } ) );

		expect( readInteractiveUiActionMessage( message ) ).toEqual( {} );
	} );

	it( 'ignores other hidden context', () => {
		const message = createContextMessage( 'Navigated to the About page.' );

		expect( readInteractiveUiActionMessage( message ) ).toBeUndefined();
	} );
} );

describe( 'getStaleInteractiveUiSurfaceIds', () => {
	const batch = createBatch( operations, 'agent' );
	const update = createBatch( [ operations[ 1 ] ], 'update' );

	const options = {
		messageIndexes: new Map( [ [ 'agent', 1 ] ] ),
		latestUserMessageIndex: 0,
		restoredMessageIds: new Set< string >(),
	};

	it.each( [
		[ 'the user has replied past it', batch, { ...options, latestUserMessageIndex: 2 } ],
		[
			'the editor has another page open',
			{ ...batch, postId: 7 },
			{ ...options, currentPostId: 8 },
		],
		[
			'it was restored from history',
			batch,
			{ ...options, restoredMessageIds: new Set( [ 'agent' ] ) },
		],
		[ 'its message has left the transcript', batch, { ...options, messageIndexes: new Map() } ],
	] )( 'marks a surface stale when %s', ( _description, staleBatch, staleOptions ) => {
		expect( getStaleInteractiveUiSurfaceIds( [ staleBatch ], staleOptions ) ).toEqual(
			new Set( [ 'test-surface' ] )
		);
	} );

	it( 'skips malformed operations', () => {
		const malformed = {
			...batch,
			operations: [ ...operations, null ] as unknown as InteractiveUiBatch[ 'operations' ],
		};

		expect(
			getStaleInteractiveUiSurfaceIds( [ malformed ], { ...options, latestUserMessageIndex: 2 } )
		).toEqual( new Set( [ 'test-surface' ] ) );
	} );

	it( 'keeps a surface’s page when a later update doesn’t name one', () => {
		expect(
			getStaleInteractiveUiSurfaceIds( [ { ...batch, postId: 7 }, update ], {
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
		const staleSurfaceIds = getStaleInteractiveUiSurfaceIds( [ batch, update ], {
			...options,
			messageIndexes: new Map( [
				[ 'agent', 1 ],
				[ 'update', 3 ],
			] ),
			latestUserMessageIndex: 2,
		} );

		expect( staleSurfaceIds ).toEqual( new Set() );
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
		const [ create, update ] = formOperations;
		const batches = [ createBatch( [ create ], 'agent-1' ), createBatch( [ update ], 'agent-2' ) ];

		expect(
			keepInteractiveUiSurfacesInTranscript( [ 'form' ], batches, new Map( [ [ 'agent-1', 0 ] ] ) )
		).toEqual( [] );
	} );
} );
