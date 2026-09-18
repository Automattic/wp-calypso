jest.mock( '@wordpress/blocks', () => ( {
	getBlockTypes: jest.fn( () => [
		{ name: 'core/paragraph', attributes: { content: {} } },
		{ name: 'core/button', attributes: { url: {}, text: {} } },
	] ),
} ) );
jest.mock( '../../../utils/editor-blocks', () => ( { getBlock: jest.fn() } ) );

import { getBlock } from '../../../utils/editor-blocks';
import {
	captureTargets,
	getEditedClientIds,
	getValidationDetails,
	haveBlocksChanged,
} from '../validation-details';
import type { EditorBlock, PageBlocks } from '../../../utils/editor-blocks';
import type { BlockEdits, BlockUpdate } from '../types';

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

const paragraph = ( content: string ) => block( 'paragraph', 'core/paragraph', { content } );

const page = ( blocks: EditorBlock[], templateParts: PageBlocks[ 'templateParts' ] = [] ) => ( {
	blocks,
	templateParts,
} );

const edits = ( partial: Partial< BlockEdits > ): BlockEdits => ( {
	updates: [],
	inserts: [],
	deletes: [],
	...partial,
} );

const contentUpdate = ( content: string ): BlockUpdate => ( {
	clientId: 'para',
	name: 'core/paragraph',
	attributes: { content },
} );

const shortIds: Record< string, string > = { para: 'paragraph', btn: 'button' };
const resolve = ( id: string ) => shortIds[ id ] ?? id;

const withEditorBlocks = ( ...blocks: EditorBlock[] ) =>
	jest
		.mocked( getBlock )
		.mockImplementation( ( clientId ) => blocks.find( ( item ) => item.clientId === clientId ) );

const listBlocks = ( { blocks, templateParts }: PageBlocks ) => [
	...blocks,
	...templateParts.flatMap( ( part ) => part.blocks ),
];

/**
 * Captures before the edits, as the callback does, then validates against the
 * page after them. The editor serves the page lists unless `editorBefore` /
 * `editorAfter` say otherwise; `resolveAfter` is the resolver the apply left.
 */
function validate(
	requested: BlockEdits,
	before: PageBlocks,
	after: PageBlocks,
	{
		recoveredTargetIds = [] as string[],
		editorBefore = listBlocks( before ),
		editorAfter = listBlocks( after ),
		resolveAfter = resolve,
	} = {}
) {
	withEditorBlocks( ...editorBefore );

	const capturedTargets = captureTargets( requested, resolve );

	withEditorBlocks( ...editorAfter );

	return getValidationDetails( {
		edits: requested,
		resolve: resolveAfter,
		before,
		after,
		capturedTargets,
		recoveredTargetIds: new Set( recoveredTargetIds ),
	} );
}

beforeEach( () => {
	jest.clearAllMocks();
	withEditorBlocks();
} );

describe( 'captureTargets', () => {
	it( 'keeps a copy of each target under the id the agent sent, and only the id of a target that names no block', () => {
		const button = block( 'button', 'core/button', { style: { color: 'red' } } );
		withEditorBlocks( button );

		const targets = captureTargets( edits( { deletes: [ 'btn', 'missing' ] } ), resolve );

		expect( targets.get( 'btn' ) ).toEqual( {
			resolvedClientId: 'button',
			beforeBlock: { clientId: 'button', name: 'core/button', attributes: button.attributes },
		} );
		expect( targets.get( 'btn' )?.beforeBlock?.attributes ).not.toBe( button.attributes );
		expect( targets.get( 'missing' ) ).toEqual( { resolvedClientId: 'missing' } );
	} );
} );

describe( 'haveBlocksChanged', () => {
	const header = ( content: string ) => [ { slug: 'header', blocks: [ paragraph( content ) ] } ];

	it( 'sees a change inside a template part, and none between equal states', () => {
		expect( haveBlocksChanged( page( [], header( 'A' ) ), page( [], header( 'B' ) ) ) ).toBe(
			true
		);
		expect( haveBlocksChanged( page( [], header( 'A' ) ), page( [], header( 'A' ) ) ) ).toBe(
			false
		);
	} );
} );

describe( 'getEditedClientIds', () => {
	it( 'resolves each updated block once and drops an id that names no block', () => {
		withEditorBlocks( paragraph( 'A' ) );
		const requested = edits( {
			updates: [
				contentUpdate( 'A' ),
				contentUpdate( 'B' ),
				{ ...contentUpdate( 'C' ), clientId: 'missing' },
			],
		} );

		expect( getEditedClientIds( requested, resolve ) ).toEqual( [ 'paragraph' ] );
	} );
} );

describe( 'getValidationDetails', () => {
	it( 'reports a content change with the text the page now shows', () => {
		const details = validate(
			edits( { updates: [ contentUpdate( '<strong>After</strong> text' ) ] } ),
			page( [ paragraph( 'Before' ) ] ),
			page( [ paragraph( '<strong>After</strong> text' ) ] )
		);

		expect( details ).toEqual( {
			appliedOperations: { addedCount: 0, removedCount: 0, modifiedCount: 1 },
			attributeResults: [
				{
					blockName: 'core/paragraph',
					requestedClientId: 'para',
					resolvedClientId: 'paragraph',
					path: 'content',
					requested: '<strong>After</strong> text',
					before: 'Before',
					after: '<strong>After</strong> text',
					status: 'changed',
				},
			],
			contentTextSnapshot: 'After text',
		} );
	} );

	it.each( [
		[ 'already-satisfied', 'Same', 'Same', 'Same' ],
		[ 'unchanged', 'Old', 'Old', 'New' ],
		[ 'mismatch', 'Old', 'Other', 'New' ],
		[ 'missing-after-apply', 'Old', null, 'New' ],
		[ 'unresolved', null, null, 'New' ],
	] )(
		'marks an attribute `%s` when the page had %p, shows %p and %p was requested',
		( status, before, after, requested ) => {
			const details = validate(
				edits( { updates: [ contentUpdate( requested ) ] } ),
				page( before === null ? [] : [ paragraph( before ) ] ),
				page( after === null ? [] : [ paragraph( after ) ] )
			);

			expect( details.attributeResults ).toEqual( [ expect.objectContaining( { status } ) ] );
		}
	);

	it( 'tells a removed delete target from one still present and one that never existed', () => {
		const gone = block( 'gone', 'core/paragraph' );
		const stuck = block( 'stuck', 'core/button' );

		const details = validate(
			edits( { deletes: [ 'gone', 'stuck', 'missing' ] } ),
			page( [ gone, stuck ] ),
			page( [ stuck ] )
		);

		expect( details ).toEqual( {
			appliedOperations: { addedCount: 0, removedCount: 1, modifiedCount: 0 },
			unresolvedTargets: [
				{
					operation: 'delete',
					requestedClientId: 'missing',
					resolvedClientId: 'missing',
					reason: 'not-found',
				},
			],
			deleteResults: [
				{
					requestedClientId: 'gone',
					resolvedClientId: 'gone',
					blockName: 'core/paragraph',
					status: 'removed',
				},
				{
					requestedClientId: 'stuck',
					resolvedClientId: 'stuck',
					blockName: 'core/button',
					status: 'still-present',
				},
				{ requestedClientId: 'missing', resolvedClientId: 'missing', status: 'unresolved' },
			],
		} );
	} );

	// The block-editing agent reorders top-level blocks through a `core/post-content`
	// parent the post editor does not have; the apply recovers that (AI-1133).
	it( 'leaves a recovered update target out of the unresolved list, but not a delete of the same id', () => {
		const heading = block( 'heading', 'core/heading' );
		const requested = edits( {
			updates: [ { clientId: 'core/post-content', name: 'core/post-content' } ],
			deletes: [ 'core/post-content' ],
		} );

		const details = validate(
			requested,
			page( [ heading, paragraph( 'A' ) ] ),
			page( [ paragraph( 'A' ), heading ] ),
			{ recoveredTargetIds: [ 'core/post-content' ] }
		);

		expect( details.unresolvedTargets ).toEqual( [
			expect.objectContaining( { operation: 'delete', requestedClientId: 'core/post-content' } ),
		] );
	} );

	it.each( [
		[ 'the page', ( blocks: EditorBlock[] ) => page( blocks ) ],
		[ 'a template part', ( blocks: EditorBlock[] ) => page( [], [ { slug: 'header', blocks } ] ) ],
	] )( 'counts a bare reorder at the root of %s as one modification', ( _, build ) => {
		const heading = block( 'heading', 'core/heading' );

		const details = validate(
			edits( { updates: [ { clientId: 'core/post-content', name: 'core/post-content' } ] } ),
			build( [ heading, paragraph( 'A' ) ] ),
			build( [ paragraph( 'A' ), heading ] ),
			{ recoveredTargetIds: [ 'core/post-content' ] }
		);

		expect( details.appliedOperations ).toEqual( {
			addedCount: 0,
			removedCount: 0,
			modifiedCount: 1,
		} );
	} );

	it( 'flags a requested attribute the block type does not register', () => {
		const update = { ...contentUpdate( 'A' ), attributes: { content: 'A', align: 'wide' } };

		const details = validate(
			edits( { updates: [ update ] } ),
			page( [ paragraph( 'A' ) ] ),
			page( [ paragraph( 'A' ) ] )
		);

		expect( details.unsupportedAttributes ).toEqual( [
			{
				blockName: 'core/paragraph',
				requestedClientId: 'para',
				path: 'align',
				reason: 'not-registered-attribute',
			},
		] );
	} );

	it( 'reads a replaced block under the clientId the resolver gives after the apply', () => {
		const details = validate(
			edits( {
				updates: [ { clientId: 'btn', name: 'core/button', attributes: { url: 'new' } } ],
			} ),
			page( [ block( 'button', 'core/button', { url: 'old' } ) ] ),
			page( [ block( 'button-2', 'core/button', { url: 'new' } ) ] ),
			{ resolveAfter: ( id ) => ( id === 'btn' ? 'button-2' : id ) }
		);

		expect( details.appliedOperations ).toEqual( {
			addedCount: 1,
			removedCount: 1,
			modifiedCount: 0,
		} );
		expect( details.attributeResults ).toEqual( [
			expect.objectContaining( {
				resolvedClientId: 'button-2',
				before: 'old',
				after: 'new',
				status: 'changed',
			} ),
		] );
	} );

	// A block the template holds outside the page's roots, such as a `core/post-title`.
	it( 'reads a target the page lists do not hold from the editor', () => {
		const details = validate(
			edits( {
				updates: [ { clientId: 'title', name: 'core/post-title', attributes: { level: 1 } } ],
			} ),
			page( [] ),
			page( [] ),
			{
				editorBefore: [ block( 'title', 'core/post-title', { level: 2 } ) ],
				editorAfter: [ block( 'title', 'core/post-title', { level: 1 } ) ],
			}
		);

		expect( details ).toEqual( {
			appliedOperations: { addedCount: 0, removedCount: 0, modifiedCount: 0 },
			attributeResults: [
				expect.objectContaining( { path: 'level', before: 2, after: 1, status: 'changed' } ),
			],
		} );
	} );

	it( 'caps a list at ten entries and a string at 300 characters', () => {
		const longText = 'x'.repeat( 400 );
		const updates = Array.from( { length: 12 }, ( _, index ) => ( {
			clientId: `p${ index }`,
			name: 'core/paragraph',
			attributes: { content: longText },
		} ) );
		const blocks = updates.map( ( { clientId } ) =>
			block( clientId, 'core/paragraph', { content: longText } )
		);

		const details = validate( edits( { updates } ), page( blocks ), page( blocks ) );

		expect( details.attributeResults ).toHaveLength( 10 );
		expect( details.attributeResults?.[ 0 ].after ).toBe( `${ 'x'.repeat( 300 ) }…` );
		expect( details.contentTextSnapshot ).toHaveLength( 301 );
	} );
} );
