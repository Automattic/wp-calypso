jest.mock( '@wordpress/blocks', () => ( { createBlock: jest.fn() } ) );
jest.mock( '../../../utils/canvas-guard', () => ( { assertCanvasUnmoved: jest.fn() } ) );
jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlockParents: jest.fn(),
	getBlockRootClientId: jest.fn(),
	getBlocks: jest.fn(),
	insertBlock: jest.fn(),
	removeBlock: jest.fn(),
	replaceBlock: jest.fn(),
	replaceInnerBlocks: jest.fn(),
	resolveBlocksRoot: jest.fn(),
	updateBlockAttributes: jest.fn(),
} ) );
jest.mock( '../../../utils/navigation-menu', () => ( { NAVIGATION_BLOCK: 'core/navigation' } ) );
jest.mock( '../cover-image', () => ( { syncCoverWithImage: jest.fn() } ) );

import { createBlock } from '@wordpress/blocks';
import { assertCanvasUnmoved } from '../../../utils/canvas-guard';
import {
	getBlock,
	getBlockParents,
	getBlockRootClientId,
	getBlocks,
	insertBlock,
	removeBlock,
	replaceBlock,
	replaceInnerBlocks,
	resolveBlocksRoot,
	updateBlockAttributes,
} from '../../../utils/editor-blocks';
import { applyEdits } from '../apply-edits';
import { syncCoverWithImage } from '../cover-image';
import type { EditorBlock, UndoLevel } from '../../../utils/editor-blocks';
import type { BlockEdits } from '../types';

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

/**
 * The editor: blocks by clientId, each one's parent, and the child lists of
 * the parents that control their own children, which their nodes leave empty.
 * `''` is the document root's list.
 */
let blocks: Record< string, EditorBlock >;
let parents: Record< string, string >;
let controlled: Record< string, EditorBlock[] >;
let consoleError: jest.SpyInstance;

const useTree = ( roots: EditorBlock[] ) => {
	const register = ( node: EditorBlock, parent?: string ) => {
		blocks[ node.clientId ] = node;

		if ( parent ) {
			parents[ node.clientId ] = parent;
		}

		node.innerBlocks.forEach( ( child ) => register( child, node.clientId ) );
	};

	controlled[ '' ] = roots;
	roots.forEach( ( root ) => register( root ) );
};

const useControlledChildren = ( parent: string, children: EditorBlock[] ) => {
	controlled[ parent ] = children;
	children.forEach( ( child ) => {
		blocks[ child.clientId ] = child;
		parents[ child.clientId ] = parent;
	} );
};

// The agent refers to blocks by `ref-<clientId>`.
const resolve = ( id: string ) => id.replace( /^ref-/, '' );
const onReplaced = jest.fn();
// Every write goes through the level; which ones, in what order, is what it records.
const writes: unknown[] = [];
const level: UndoLevel = {
	write:
		( write ) =>
		( ...args ) => {
			writes.push( write );
			write( ...args );
		},
	close: jest.fn(),
};

const run = ( edits: Partial< BlockEdits > ) => {
	const applied = applyEdits(
		{ inserts: [], updates: [], deletes: [], ...edits },
		{ resolve, onReplaced, level }
	);

	// Both handled at once, so a rejection reaches the test instead of the process.
	return Promise.all( [ applied, jest.runAllTimersAsync() ] ).then( ( [ result ] ) => result );
};

beforeEach( () => {
	jest.resetAllMocks();
	jest.useFakeTimers();
	consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

	blocks = {};
	parents = {};
	controlled = {};
	writes.length = 0;

	jest.mocked( createBlock ).mockImplementation( ( name, attributes = {}, innerBlocks = [] ) => ( {
		clientId: `new-${ name }`,
		name,
		attributes,
		innerBlocks,
		isValid: true,
	} ) );
	jest.mocked( getBlock ).mockImplementation( ( id ) => blocks[ id ] );
	jest
		.mocked( getBlocks )
		.mockImplementation( ( id = '' ) => controlled[ id ] ?? blocks[ id ]?.innerBlocks ?? [] );
	jest.mocked( getBlockRootClientId ).mockImplementation( ( id ) => parents[ id ] );
	jest
		.mocked( resolveBlocksRoot )
		.mockReturnValue( { kind: 'document', clientId: '', post: { id: 1, type: 'page' } } );
	jest.mocked( getBlockParents ).mockImplementation( ( id ) => {
		const ancestors: string[] = [];

		for ( let parent = parents[ id ]; parent; parent = parents[ parent ] ) {
			ancestors.unshift( parent );
		}

		return ancestors;
	} );
	// A write that lands, as the editor's does.
	jest.mocked( insertBlock ).mockImplementation( ( inserted ) => {
		blocks[ inserted.clientId ] = inserted;
	} );
	jest.mocked( removeBlock ).mockImplementation( ( id ) => {
		delete blocks[ id ];
	} );
} );

afterEach( () => {
	jest.useRealTimers();
	jest.restoreAllMocks();
} );

describe( 'inserts', () => {
	const paragraph = { name: 'core/paragraph', attributes: { content: 'Hi' } };

	it( 'inserts under the resolved parent, once the created inner blocks have had their tick', async () => {
		useTree( [ block( 'group', 'core/group' ) ] );

		const applied = run( {
			inserts: [ { parentClientId: 'ref-group', index: 1, block: paragraph } ],
		} );

		expect( insertBlock ).not.toHaveBeenCalled();

		const { insertedClientIds } = await applied;

		expect( insertBlock ).toHaveBeenCalledWith(
			expect.objectContaining( { clientId: 'new-core/paragraph' } ),
			1,
			'group'
		);
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();
		expect( insertedClientIds ).toEqual( [ 'new-core/paragraph' ] );
	} );

	// The same root the checkpoint snapshots; the document root has no block.
	it.each( [
		[ 'the page root', { kind: 'section', clientId: 'section' }, 'section' ],
		[ 'the document', { kind: 'document', clientId: 'document-root' }, undefined ],
	] )( 'inserts at the top of %s when no parent is given', async ( _, root, parent ) => {
		jest
			.mocked( resolveBlocksRoot )
			.mockReturnValue( { ...root, post: { id: 1, type: 'page' } } as never );

		await run( { inserts: [ { block: paragraph } ] } );

		expect( insertBlock ).toHaveBeenCalledWith( expect.anything(), 0, parent );
	} );

	it( 'refuses a parentless insert while the editor holds no page', async () => {
		jest.mocked( resolveBlocksRoot ).mockReturnValue( null );

		await expect( run( { inserts: [ { block: paragraph } ] } ) ).rejects.toThrow(
			'[Edit Blocks] The editor has no page open to insert into.'
		);
		expect( insertBlock ).not.toHaveBeenCalled();
	} );

	it( 'refuses a parent that names no block', async () => {
		await expect(
			run( { inserts: [ { parentClientId: 'nope', block: paragraph } ] } )
		).rejects.toThrow( '[Edit Pattern] Parent block not found with clientId: nope' );
		expect( insertBlock ).not.toHaveBeenCalled();
	} );

	describe( 'into a controlled parent that drops the insert', () => {
		const paragraphs = [ 0, 1, 2 ].map( ( i ) => block( `p${ i }`, 'core/paragraph' ) );
		const insertSeparator = () =>
			run( {
				inserts: [
					{ parentClientId: 'ref-post-content', index: 1, block: { name: 'core/separator' } },
				],
			} );

		beforeEach( () => {
			useTree( [ block( 'post-content', 'core/post-content' ) ] );
			useControlledChildren( 'post-content', paragraphs );
			jest.mocked( insertBlock ).mockImplementation( () => {} );
		} );

		it( 'splices the block into the existing children instead (BSKY-1992)', async () => {
			await insertSeparator();

			expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'post-content', [
				paragraphs[ 0 ],
				expect.objectContaining( { name: 'core/separator' } ),
				paragraphs[ 1 ],
				paragraphs[ 2 ],
			] );
		} );

		it( 'leaves the parent alone when its list reads back empty', async () => {
			jest.mocked( insertBlock ).mockImplementation( () => {
				controlled[ 'post-content' ] = [];
			} );

			await insertSeparator();

			expect( replaceInnerBlocks ).not.toHaveBeenCalled();
			expect( consoleError ).toHaveBeenCalled();
		} );
	} );
} );

describe( 'updates', () => {
	const x = block( 'x', 'core/paragraph', { content: 'X' } );
	const y = block( 'y', 'core/paragraph', { content: 'Y' } );
	const a = block( 'a', 'core/group', { className: 'a' }, [ x, y ] );
	const b = block( 'b', 'core/paragraph', { content: 'B' } );
	const group = block( 'g', 'core/group', { className: 'g' }, [ a, b ] );

	beforeEach( () => useTree( [ group ] ) );

	it( 'moves the children of a pure reorder in place, deepest first', async () => {
		await run( {
			updates: [
				{
					clientId: 'ref-g',
					name: 'core/group',
					innerBlocks: [
						{ clientId: 'ref-b' },
						{ clientId: 'ref-a', innerBlocks: [ { clientId: 'ref-y' }, { clientId: 'ref-x' } ] },
					],
				},
			],
		} );

		expect( replaceInnerBlocks ).toHaveBeenNthCalledWith( 1, 'a', [ y, x ] );
		expect( replaceInnerBlocks ).toHaveBeenNthCalledWith( 2, 'g', [ b, a ] );
		expect( replaceBlock ).not.toHaveBeenCalled();
	} );

	it( 'gives a structural parent the listed children when the request is more than a reorder', async () => {
		const paragraphs = [ 0, 1, 2 ].map( ( i ) => block( `p${ i }`, 'core/paragraph' ) );

		useTree( [ block( 'post-content', 'core/post-content' ) ] );
		useControlledChildren( 'post-content', paragraphs );

		await run( {
			updates: [
				{
					clientId: 'ref-post-content',
					name: 'core/post-content',
					innerBlocks: [ { clientId: 'ref-p2' }, { clientId: 'ref-p0' } ],
				},
			],
		} );

		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'post-content', [
			paragraphs[ 2 ],
			paragraphs[ 0 ],
		] );
		expect( replaceBlock ).not.toHaveBeenCalled();
		expect( updateBlockAttributes ).not.toHaveBeenCalled();
	} );

	it( "writes a structural parent's own attributes along with its reordered children", async () => {
		const columns = [ 0, 1 ].map( ( i ) => block( `c${ i }`, 'core/column' ) );

		useTree( [ block( 'columns', 'core/columns', { verticalAlignment: 'top' }, columns ) ] );

		await run( {
			updates: [
				{
					clientId: 'ref-columns',
					name: 'core/columns',
					attributes: { verticalAlignment: 'center' },
					innerBlocks: [ { clientId: 'ref-c1' }, { clientId: 'ref-c0' } ],
				},
			],
		} );

		expect( updateBlockAttributes ).toHaveBeenCalledWith( 'columns', {
			verticalAlignment: 'center',
		} );
		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'columns', [ columns[ 1 ], columns[ 0 ] ] );
	} );

	it( 'applies the edits the reordered children carry', async () => {
		const paragraphs = [ 0, 1 ].map( ( i ) =>
			block( `p${ i }`, 'core/paragraph', { content: `${ i }` } )
		);

		useTree( [ block( 'post-content', 'core/post-content' ) ] );
		useControlledChildren( 'post-content', paragraphs );

		await run( {
			updates: [
				{
					clientId: 'ref-post-content',
					name: 'core/post-content',
					innerBlocks: [
						{ clientId: 'ref-p1', attributes: { content: 'Last first' } },
						{ clientId: 'ref-p0' },
					],
				},
			],
		} );

		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'post-content', [
			paragraphs[ 1 ],
			paragraphs[ 0 ],
		] );
		expect( updateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		expect( updateBlockAttributes ).toHaveBeenCalledWith( 'p1', { content: 'Last first' } );
	} );

	it( "moves a menu's items in place rather than rebuilding its navigation block", async () => {
		const items = [ 0, 1 ].map( ( i ) => block( `i${ i }`, 'core/navigation-link' ) );

		useTree( [ block( 'nav', 'core/navigation', { ref: 9 } ) ] );
		useControlledChildren( 'nav', items );

		await run( {
			updates: [
				{
					clientId: 'ref-nav',
					name: 'core/navigation',
					attributes: { overlayMenu: 'never' },
					innerBlocks: [ { clientId: 'ref-i1' }, { clientId: 'ref-i0' } ],
				},
			],
		} );

		expect( updateBlockAttributes ).toHaveBeenCalledWith(
			'nav',
			expect.objectContaining( { overlayMenu: 'never' } )
		);
		expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'nav', [ items[ 1 ], items[ 0 ] ] );
		expect( replaceBlock ).not.toHaveBeenCalled();
	} );

	it( 'refuses a structural parent child that names no block', async () => {
		useTree( [ block( 'columns', 'core/columns', {}, [ block( 'c', 'core/column' ) ] ) ] );

		await expect(
			run( {
				updates: [
					{ clientId: 'ref-columns', name: 'core/columns', innerBlocks: [ { clientId: 'nope' } ] },
				],
			} )
		).rejects.toThrow(
			'[Edit Blocks] Could not find post content child block for reordering: nope'
		);
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();
	} );

	it( 'updates attributes in place, passing a null delete signal as undefined', async () => {
		useTree( [ block( 'h', 'core/heading', { content: 'Hi', level: 2, fontSize: 'large' } ) ] );

		await run( {
			updates: [ { clientId: 'ref-h', name: 'core/heading', attributes: { fontSize: null } } ],
		} );

		expect( jest.mocked( updateBlockAttributes ).mock.calls ).toStrictEqual( [
			[ 'h', { content: 'Hi', level: 2, fontSize: undefined } ],
		] );
		expect( replaceBlock ).not.toHaveBeenCalled();
	} );

	// The image's derived attributes follow the write, on the block that holds it now.
	it.each( [
		[ 'in place', {}, 'cover' ],
		[
			'by replacement',
			{ innerBlocks: [ { name: 'core/heading', attributes: { content: 'Hi' } } ] },
			'new-core/cover',
		],
	] )( 'settles a cover after its image changes %s', async ( _, extra, clientId ) => {
		const cover = block( 'cover', 'core/cover', { url: 'old.jpg' } );

		useTree( [ cover ] );

		await run( {
			updates: [
				{ clientId: 'ref-cover', name: 'core/cover', attributes: { url: 'new.jpg' }, ...extra },
			],
		} );

		expect( syncCoverWithImage ).toHaveBeenCalledWith(
			clientId,
			cover,
			{ url: 'new.jpg' },
			expect.any( Function )
		);

		// The derived write lands in the same undo level as the edit.
		const write = jest.mocked( syncCoverWithImage ).mock.calls[ 0 ][ 3 ];
		const written = writes.length;

		write( clientId, { isDark: true } );

		expect( updateBlockAttributes ).toHaveBeenLastCalledWith( clientId, { isDark: true } );
		expect( writes ).toHaveLength( written + 1 );
	} );

	// The recreated children get new clientIds; ids the call still uses follow them.
	it( 'follows the children of a replaced block, listed or not', async () => {
		await run( {
			updates: [
				{
					clientId: 'ref-g',
					name: 'core/group',
					attributes: { className: 'g2' },
					innerBlocks: [ { clientId: 'ref-b' }, { clientId: 'ref-a' } ],
				},
			],
		} );

		expect( onReplaced ).toHaveBeenCalledWith( 'ref-b', 'new-core/paragraph' );
		expect( onReplaced ).toHaveBeenCalledWith( 'ref-a', 'new-core/group' );
		expect( onReplaced ).toHaveBeenCalledWith( 'x', 'new-core/paragraph' );
		expect( syncCoverWithImage ).toHaveBeenCalledWith(
			'new-core/group',
			expect.objectContaining( { clientId: 'a' } ),
			undefined,
			expect.any( Function )
		);
	} );

	it( 'applies a type change to a reordered child of a structural parent', async () => {
		const paragraphs = [ 0, 1 ].map( ( i ) => block( `p${ i }`, 'core/paragraph' ) );

		useTree( [ block( 'post-content', 'core/post-content' ) ] );
		useControlledChildren( 'post-content', paragraphs );

		await run( {
			updates: [
				{
					clientId: 'ref-post-content',
					name: 'core/post-content',
					innerBlocks: [ { clientId: 'ref-p1', name: 'core/heading' }, { clientId: 'ref-p0' } ],
				},
			],
		} );

		expect( replaceBlock ).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining( { name: 'core/heading' } )
		);
	} );

	it( 'replaces the block when the update changes its type', async () => {
		await run( {
			updates: [ { clientId: 'ref-b', name: 'core/heading', attributes: { level: 2 } } ],
		} );

		expect( replaceBlock ).toHaveBeenCalledWith(
			'b',
			expect.objectContaining( { name: 'core/heading', attributes: { content: 'B', level: 2 } } )
		);
		expect( updateBlockAttributes ).not.toHaveBeenCalled();
	} );

	it( 'replaces the block for a structural change and reports its new clientId', async () => {
		await run( {
			updates: [
				{
					clientId: 'ref-g',
					name: 'core/group',
					attributes: { className: 'g2' },
					innerBlocks: [
						{ clientId: 'ref-a', innerBlocks: [] },
						{ name: 'core/heading', attributes: { content: 'New' } },
					],
				},
			],
		} );

		expect( replaceBlock ).toHaveBeenCalledWith( 'g', {
			clientId: 'new-core/group',
			name: 'core/group',
			attributes: { className: 'g2' },
			innerBlocks: [
				expect.objectContaining( {
					name: 'core/group',
					attributes: { className: 'a' },
					innerBlocks: [
						expect.objectContaining( { attributes: { content: 'X' } } ),
						expect.objectContaining( { attributes: { content: 'Y' } } ),
					],
				} ),
				expect.objectContaining( { name: 'core/heading', attributes: { content: 'New' } } ),
			],
			isValid: true,
		} );
		expect( onReplaced ).toHaveBeenCalledWith( 'ref-g', 'new-core/group' );
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();
	} );

	it( 'applies inner updates before outer ones, whose replacement would change the inner clientIds', async () => {
		await run( {
			updates: [
				{ clientId: 'ref-g', name: 'core/group', attributes: { className: 'g2' } },
				{ clientId: 'ref-x', name: 'core/paragraph', attributes: { content: 'X2' } },
			],
		} );

		expect( updateBlockAttributes ).toHaveBeenNthCalledWith( 1, 'x', { content: 'X2' } );
		expect( updateBlockAttributes ).toHaveBeenNthCalledWith( 2, 'g', { className: 'g2' } );
	} );

	it( 'does not recover a not-found id that is not the core/post-content literal', async () => {
		await expect(
			run( {
				updates: [
					{
						clientId: 'zzzz',
						name: 'core/group',
						innerBlocks: [ { clientId: 'ref-b' }, { clientId: 'ref-a' } ],
					},
				],
			} )
		).rejects.toThrow( '[Edit Blocks] Block not found with clientId: zzzz' );
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();
	} );

	describe( 'addressed to a core/post-content parent the post editor lacks (AI-1133)', () => {
		const heading = block( 'heading', 'core/heading' );
		const first = block( 'first', 'core/paragraph' );
		const second = block( 'second', 'core/paragraph' );
		const reorderPostContent = ( ...ids: string[] ) =>
			run( {
				updates: [
					{
						clientId: 'core/post-content',
						name: 'core/post-content',
						innerBlocks: ids.map( ( id ) => ( { clientId: `ref-${ id }` } ) ),
					},
				],
			} );

		beforeEach( () => useTree( [ heading, first, second ] ) );

		it( 'reorders the root list and reports the id as recovered', async () => {
			const { recoveredTargetIds } = await reorderPostContent( 'heading', 'second', 'first' );

			expect( replaceInnerBlocks ).toHaveBeenCalledWith( '', [ heading, second, first ] );
			expect( recoveredTargetIds ).toEqual( new Set( [ 'core/post-content' ] ) );
		} );

		it( 'declines an update that names another block type', async () => {
			useTree( [ block( 'h', 'core/heading' ), block( 'p', 'core/paragraph' ) ] );

			await expect(
				run( {
					updates: [
						{
							clientId: 'core/post-content',
							name: 'core/group',
							innerBlocks: [ { clientId: 'ref-p' }, { clientId: 'ref-h' } ],
						},
					],
				} )
			).rejects.toThrow( '[Edit Blocks] Block not found with clientId: core/post-content' );
			expect( replaceInnerBlocks ).not.toHaveBeenCalled();
		} );

		it( 'keeps the not-found error when the recovery declines', async () => {
			await expect( reorderPostContent( 'second', 'first' ) ).rejects.toThrow(
				'[Edit Blocks] Block not found with clientId: core/post-content'
			);
			expect( replaceInnerBlocks ).not.toHaveBeenCalled();
		} );
	} );
} );

describe( 'deletes', () => {
	const paragraphs = [ 0, 1, 2 ].map( ( i ) => block( `p${ i }`, 'core/paragraph' ) );

	beforeEach( () => {
		useTree( [ block( 'post-content', 'core/post-content' ) ] );
		useControlledChildren( 'post-content', paragraphs );
	} );

	it( 'removes the resolved block', async () => {
		await run( { deletes: [ 'ref-p1' ] } );

		expect( removeBlock ).toHaveBeenCalledWith( 'p1' );
		expect( replaceInnerBlocks ).not.toHaveBeenCalled();
	} );

	it( 'reports a block that names nothing without throwing', async () => {
		await expect( run( { deletes: [ 'nope' ] } ) ).resolves.toEqual( {
			recoveredTargetIds: new Set(),
			insertedClientIds: [],
		} );

		expect( consoleError ).toHaveBeenCalled();
		expect( removeBlock ).not.toHaveBeenCalled();
	} );

	describe( 'from a controlled parent that drops the removal', () => {
		beforeEach( () => jest.mocked( removeBlock ).mockImplementation( () => {} ) );

		it( 'splices the block out of its siblings instead', async () => {
			await run( { deletes: [ 'ref-p1' ] } );

			expect( replaceInnerBlocks ).toHaveBeenCalledWith( 'post-content', [
				paragraphs[ 0 ],
				paragraphs[ 2 ],
			] );
		} );

		it( 'leaves the parent alone when its list reads back empty', async () => {
			jest.mocked( removeBlock ).mockImplementation( () => {
				controlled[ 'post-content' ] = [];
			} );

			await run( { deletes: [ 'ref-p1' ] } );

			expect( replaceInnerBlocks ).not.toHaveBeenCalled();
			expect( consoleError ).toHaveBeenCalled();
		} );
	} );
} );

// The batch yields between writes, and the user may leave the page while it does.
it( 'stops before the next write once the canvas has moved', async () => {
	jest
		.mocked( assertCanvasUnmoved )
		.mockImplementationOnce( () => {} )
		.mockImplementationOnce( () => {
			throw new Error( 'moved' );
		} );

	await expect(
		run( {
			inserts: [ { block: { name: 'core/paragraph' } }, { block: { name: 'core/heading' } } ],
		} )
	).rejects.toThrow( 'moved' );
	expect( insertBlock ).toHaveBeenCalledTimes( 1 );
	// The refused write never reached the undo level, so it marked nothing.
	expect( writes ).toHaveLength( 1 );
} );

it( 'checks the canvas once more after the last write', async () => {
	jest
		.mocked( assertCanvasUnmoved )
		.mockImplementationOnce( () => {} )
		.mockImplementationOnce( () => {
			throw new Error( 'moved' );
		} );

	await expect( run( { inserts: [ { block: { name: 'core/paragraph' } } ] } ) ).rejects.toThrow(
		'moved'
	);
} );

it( 'writes inserts, then updates, then deletes, all through the undo level', async () => {
	useTree( [ block( 'h', 'core/heading', { content: 'Hi' } ), block( 'p', 'core/paragraph' ) ] );

	await run( {
		deletes: [ 'ref-p' ],
		updates: [ { clientId: 'ref-h', name: 'core/heading', attributes: { content: 'Hey' } } ],
		inserts: [ { block: { name: 'core/separator' } } ],
	} );

	const order = [ insertBlock, updateBlockAttributes, removeBlock ].map(
		( write ) => jest.mocked( write ).mock.invocationCallOrder[ 0 ]
	);

	expect( writes ).toHaveLength( 3 );
	expect( order ).toEqual( [ ...order ].sort( ( a, b ) => a - b ) );
} );
