jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlockRootClientId: jest.fn(),
	getBlocks: jest.fn(),
} ) );

import { getBlock, getBlockRootClientId, getBlocks } from '../../../utils/editor-blocks';
import { getReorderOperations, getUnmappedParentReorder } from '../reorder';
import type { EditorBlock } from '../../../utils/editor-blocks';
import type { BlockData } from '../types';

// The agent refers to blocks by `ref-<clientId>`.
const resolve = ( id: string ) => id.replace( /^ref-/, '' );

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

beforeEach( () => jest.resetAllMocks() );

describe( 'getReorderOperations', () => {
	/**
	 * A tree of two children per level, `names` deep, with paragraphs as
	 * leaves. The request is the tree with every level reversed.
	 */
	const setupTree = ( names: string[] ) => {
		const blocks: Record< string, EditorBlock > = {};
		const make = ( depth: number, id: string ): EditorBlock => {
			const container = depth < names.length;
			const node = block(
				id,
				container ? names[ depth ] : 'core/paragraph',
				container ? { metadata: { name: id }, lock: { move: true } } : { content: id },
				container ? [ make( depth + 1, `${ id }-a` ), make( depth + 1, `${ id }-b` ) ] : []
			);

			blocks[ id ] = node;

			return node;
		};
		const root = make( 0, 'root' );
		const request = ( node: EditorBlock ): BlockData => ( {
			...node,
			clientId: `ref-${ node.clientId }`,
			attributes: JSON.parse( JSON.stringify( node.attributes ) ),
			innerBlocks: [ ...node.innerBlocks ].reverse().map( request ),
		} );

		jest
			.mocked( getBlocks )
			.mockImplementation( ( id ) => ( id && blocks[ id ]?.innerBlocks ) || [] );

		return { root, requested: request( root ) };
	};

	const reversed = ( parentClientId: string ) => ( {
		parentClientId,
		childClientIds: [ `${ parentClientId }-b`, `${ parentClientId }-a` ],
	} );

	it( 'plans every level of a nested tree, deepest first', () => {
		const { root, requested } = setupTree( [ 'core/group', 'core/columns', 'core/column' ] );

		expect( getReorderOperations( root, requested, resolve ) ).toEqual(
			[ 'root-b-b', 'root-b-a', 'root-b', 'root-a-b', 'root-a-a', 'root-a', 'root' ].map( reversed )
		);
	} );

	it.each( [
		[ 'an empty array', [] ],
		[ 'null', null ],
		[ 'no attributes', undefined ],
	] )( 'treats %s as attributes that already match', ( _, placeholder ) => {
		const { root, requested } = setupTree( [ 'core/group', 'core/group' ] );
		const withPlaceholders = ( node: BlockData ): BlockData => ( {
			...node,
			attributes: placeholder as BlockData[ 'attributes' ],
			innerBlocks: node.innerBlocks?.map( withPlaceholders ),
		} );

		expect( getReorderOperations( root, withPlaceholders( requested ), resolve ) ).toEqual(
			[ 'root-b', 'root-a', 'root' ].map( reversed )
		);
	} );

	it( 'keeps the children referenced with an empty list, planning only the parent order', () => {
		const { root, requested } = setupTree( [ 'core/group', 'core/group' ] );
		const children = requested.innerBlocks?.map( ( { clientId } ) => ( {
			clientId,
			name: 'core/group',
			innerBlocks: [],
		} ) );

		expect(
			getReorderOperations( root, { ...requested, innerBlocks: children }, resolve )
		).toEqual( [ reversed( 'root' ) ] );
	} );

	it( 'plans only the descendants when the outer order stays', () => {
		const { root, requested } = setupTree( [ 'core/group', 'core/group' ] );

		requested.innerBlocks?.reverse();

		expect( getReorderOperations( root, requested, resolve ) ).toEqual(
			[ 'root-a', 'root-b' ].map( reversed )
		);
	} );

	it.each( [ 'omitted', 'duplicate', 'unknown', 'attributes', 'type' ] )(
		'returns null for a tree with an %s descendant edit, however deep',
		( change ) => {
			const { root, requested } = setupTree( [ 'core/group', 'core/group' ] );
			// The first branch is a valid reorder; the later one invalidates the whole plan.
			const leaves = requested.innerBlocks?.[ 1 ].innerBlocks ?? [];

			if ( change === 'omitted' ) {
				leaves.pop();
			}
			if ( change === 'duplicate' ) {
				leaves[ 1 ] = leaves[ 0 ];
			}
			if ( change === 'unknown' ) {
				leaves[ 1 ].clientId = 'missing';
			}
			if ( change === 'attributes' ) {
				leaves[ 1 ].attributes = { content: 'Edited' };
			}
			if ( change === 'type' ) {
				leaves[ 1 ].name = 'core/group';
			}

			expect( getReorderOperations( root, requested, resolve ) ).toBeNull();
		}
	);

	it( 'reads the children of a controlled parent, whose own node leaves them empty', () => {
		const paragraphs = [ block( 'p-a', 'core/paragraph' ), block( 'p-b', 'core/paragraph' ) ];
		const postContent = block( 'post-content', 'core/post-content' );

		jest.mocked( getBlocks ).mockReturnValue( paragraphs );

		expect(
			getReorderOperations(
				postContent,
				{
					name: 'core/post-content',
					innerBlocks: [ { clientId: 'ref-p-b' }, { clientId: 'ref-p-a' } ],
				},
				resolve
			)
		).toEqual( [ { parentClientId: 'post-content', childClientIds: [ 'p-b', 'p-a' ] } ] );
		expect( getBlocks ).toHaveBeenCalledWith( 'post-content' );
	} );
} );

describe( 'getUnmappedParentReorder', () => {
	const heading = block( 'heading', 'core/heading' );
	const first = block( 'first', 'core/paragraph' );
	const second = block( 'second', 'core/paragraph' );
	const children = ( ...ids: string[] ) => ids.map( ( id ) => ( { clientId: `ref-${ id }` } ) );

	/** The children live in `list`, the post editor's root when it is `undefined`. */
	const setupList = ( list: string | undefined, blocks: EditorBlock[] ) => {
		jest
			.mocked( getBlock )
			.mockImplementation( ( id ) => blocks.find( ( b ) => b.clientId === id ) );
		jest.mocked( getBlockRootClientId ).mockReturnValue( list );
		jest
			.mocked( getBlocks )
			.mockImplementation( ( id ) => ( id === ( list ?? '' ) ? blocks : [] ) );
	};

	it( 'reorders the root list of the post editor', () => {
		setupList( undefined, [ heading, first, second ] );

		expect(
			getUnmappedParentReorder(
				{ name: 'core/post-content', innerBlocks: children( 'heading', 'second', 'first' ) },
				resolve
			)
		).toEqual( { parentClientId: '', childClientIds: [ 'heading', 'second', 'first' ] } );
	} );

	it( 'reorders the real parent list when the children live in one', () => {
		setupList( 'post-content', [ first, second ] );

		expect(
			getUnmappedParentReorder(
				{ name: 'core/post-content', innerBlocks: children( 'second', 'first' ) },
				resolve
			)
		).toEqual( { parentClientId: 'post-content', childClientIds: [ 'second', 'first' ] } );
	} );

	it.each( [
		[ 'no children', [] ],
		[ 'a sibling omitted, which the write would drop', children( 'second', 'first' ) ],
		[ 'a child that names no block', children( 'heading', 'unknown', 'first' ) ],
		[
			'a repeated child, which would put one block twice',
			children( 'heading', 'heading', 'second', 'first' ),
		],
	] )( 'declines with %s', ( _, innerBlocks ) => {
		setupList( undefined, [ heading, first, second ] );

		expect(
			getUnmappedParentReorder( { name: 'core/post-content', innerBlocks }, resolve )
		).toBeNull();
	} );

	it( 'declines children of different lists', () => {
		setupList( undefined, [ heading, first ] );
		jest
			.mocked( getBlockRootClientId )
			.mockImplementation( ( id ) => ( id === 'first' ? 'group' : undefined ) );

		expect(
			getUnmappedParentReorder(
				{ name: 'core/post-content', innerBlocks: children( 'first', 'heading' ) },
				resolve
			)
		).toBeNull();
	} );
} );
