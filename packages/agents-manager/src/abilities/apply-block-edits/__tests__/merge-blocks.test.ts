jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name: string, attributes = {}, innerBlocks = [] ) => ( {
		clientId: `new-${ name }`,
		name,
		attributes,
		innerBlocks,
	} ) ),
} ) );

import { createBlock } from '@wordpress/blocks';
import { createBlockRecursively, mergeAttributes, mergeBlocksRecursively } from '../merge-blocks';
import type { BlockAttributes, EditorBlock } from '../../../utils/editor-blocks';

const block = (
	clientId: string,
	name: string,
	attributes: BlockAttributes = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

// The agent refers to blocks by `ref-<clientId>`.
const resolve = ( id: string ) => id.replace( /^ref-/, '' );

beforeEach( () => jest.clearAllMocks() );

describe( 'mergeAttributes', () => {
	const current = { content: 'Hi', style: { color: { text: '#000' }, spacing: { top: 1 } } };

	it.each( [
		[ 'an empty object', {}, current ],
		[ 'nothing', undefined, current ],
		// The agent's placeholder for “no attributes”, outside the declared type.
		[ 'an array', [] as unknown as BlockAttributes, current ],
		[
			'a nested object, keeping the siblings',
			{ style: { color: { text: '#fff' } } },
			{ content: 'Hi', style: { color: { text: '#fff' }, spacing: { top: 1 } } },
		],
		[ 'an array, whole', { style: [ 1 ] }, { content: 'Hi', style: [ 1 ] } ],
		[
			'null, as an undefined key',
			{ content: null },
			{ content: undefined, style: current.style },
		],
	] )( 'merges %s', ( _, requested, expected ) => {
		expect( mergeAttributes( current, requested ) ).toStrictEqual( expected );
	} );
} );

describe( 'mergeBlocksRecursively', () => {
	const a = block( 'a', 'core/paragraph', { content: 'A', fontSize: 'large' } );
	const b = block( 'b', 'core/group', { className: 'b' }, [ block( 'b-1', 'core/paragraph' ) ] );
	const group = block( 'g', 'core/group', { className: 'g', layout: { type: 'flex' } }, [ a, b ] );

	it( 'keeps the listed existing children by id, merged in turn, and a new child as sent', () => {
		const heading = { name: 'core/heading', attributes: { content: 'New' } };

		const merged = mergeBlocksRecursively(
			group,
			{
				name: 'core/group',
				attributes: { className: 'g2' },
				innerBlocks: [
					{ clientId: 'ref-b', name: 'core/group', innerBlocks: [] },
					heading,
					{ clientId: 'ref-a', name: 'core/paragraph', attributes: { content: 'A2' } },
				],
			},
			resolve
		);

		expect( merged ).toEqual( {
			clientId: 'g',
			name: 'core/group',
			attributes: { className: 'g2', layout: { type: 'flex' } },
			innerBlocks: [
				{ ...b, clientId: 'ref-b' },
				heading,
				{ ...a, clientId: 'ref-a', attributes: { content: 'A2', fontSize: 'large' } },
			],
		} );
	} );

	it.each( [
		[ 'an empty', [] ],
		[ 'a null', null ],
		[ 'no', undefined ],
	] )( 'keeps the existing children for %s innerBlocks list', ( _, innerBlocks ) => {
		const merged = mergeBlocksRecursively( group, { name: 'core/group', innerBlocks }, resolve );

		expect( merged.innerBlocks ).toBe( group.innerBlocks );
	} );
} );

describe( 'createBlockRecursively', () => {
	it( 'creates the children first and hands them to their parent', () => {
		const created = createBlockRecursively( {
			name: 'core/group',
			attributes: { className: 'g' },
			innerBlocks: [ { name: 'core/paragraph', attributes: { content: 'Hi' }, innerBlocks: null } ],
		} );

		expect( createBlock ).toHaveBeenNthCalledWith( 1, 'core/paragraph', { content: 'Hi' }, [] );
		expect( createBlock ).toHaveBeenNthCalledWith( 2, 'core/group', { className: 'g' }, [
			expect.objectContaining( { clientId: 'new-core/paragraph' } ),
		] );
		expect( created.clientId ).toBe( 'new-core/group' );
	} );
} );
