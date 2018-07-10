/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	createBlock,
	cloneBlock,
	getPossibleBlockTransformations,
	switchToBlockType,
	getBlockTransforms,
	findTransform,
} from '../factory';
import { getBlockTypes, unregisterBlockType, setUnknownTypeHandlerName, registerBlockType } from '../registration';

describe( 'block factory', () => {
	const defaultBlockSettings = {
		attributes: {
			value: {
				type: 'string',
			},
		},
		save: noop,
		category: 'common',
		title: 'block title',
	};

	beforeAll( () => {
		// Load blocks store
		require( 'blocks/store' );
	} );

	afterEach( () => {
		setUnknownTypeHandlerName( undefined );
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
	} );

	describe( 'createBlock()', () => {
		it( 'should create a block given its blockType, attributes, inner blocks', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					align: {
						type: 'string',
					},
					includesDefault: {
						type: 'boolean',
						default: true,
					},
					includesFalseyDefault: {
						type: 'number',
						default: 0,
					},
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			const block = createBlock(
				'core/test-block',
				{ align: 'left' },
				[ createBlock( 'core/test-block' ) ],
			);

			expect( block.name ).toEqual( 'core/test-block' );
			expect( block.attributes ).toEqual( {
				includesDefault: true,
				includesFalseyDefault: 0,
				align: 'left',
			} );
			expect( block.isValid ).toBe( true );
			expect( block.innerBlocks ).toHaveLength( 1 );
			expect( block.innerBlocks[ 0 ].name ).toBe( 'core/test-block' );
			expect( typeof block.uid ).toBe( 'string' );
		} );
	} );

	describe( 'cloneBlock()', () => {
		it( 'should merge attributes into the existing block', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					align: {
						type: 'string',
					},
					isDifferent: {
						type: 'boolean',
						default: false,
					},
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			const block = deepFreeze(
				createBlock(
					'core/test-block',
					{ align: 'left' },
					[ createBlock( 'core/test-block' ) ],
				)
			);

			const clonedBlock = cloneBlock( block, {
				isDifferent: true,
			} );

			expect( clonedBlock.name ).toEqual( block.name );
			expect( clonedBlock.attributes ).toEqual( {
				align: 'left',
				isDifferent: true,
			} );
			expect( clonedBlock.innerBlocks ).toHaveLength( 1 );
			expect( typeof clonedBlock.uid ).toBe( 'string' );
			expect( clonedBlock.uid ).not.toBe( block.uid );
		} );

		it( 'should replace inner blocks of the existing block', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					align: {
						type: 'string',
					},
					isDifferent: {
						type: 'boolean',
						default: false,
					},
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			const block = deepFreeze(
				createBlock(
					'core/test-block',
					{ align: 'left' },
					[
						createBlock( 'core/test-block', { align: 'right' } ),
						createBlock( 'core/test-block', { align: 'left' } ),
					],
				)
			);

			const clonedBlock = cloneBlock( block, undefined, [
				createBlock( 'core/test-block' ),
			] );

			expect( clonedBlock.innerBlocks ).toHaveLength( 1 );
			expect( clonedBlock.innerBlocks[ 0 ].attributes ).not.toHaveProperty( 'align' );
		} );

		it( 'should clone innerBlocks if innerBlocks are not passed', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					align: {
						type: 'string',
					},
					isDifferent: {
						type: 'boolean',
						default: false,
					},
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );
			const block = deepFreeze(
				createBlock(
					'core/test-block',
					{ align: 'left' },
					[
						createBlock( 'core/test-block', { align: 'right' } ),
						createBlock( 'core/test-block', { align: 'left' } ),
					],
				)
			);

			const clonedBlock = cloneBlock( block );

			expect( clonedBlock.innerBlocks ).toHaveLength( 2 );
			expect( clonedBlock.innerBlocks[ 0 ].uid ).not.toBe( block.innerBlocks[ 0 ].uid );
			expect( clonedBlock.innerBlocks[ 0 ].attributes ).not.toBe( block.innerBlocks[ 0 ].attributes );
			expect( clonedBlock.innerBlocks[ 0 ].attributes ).toEqual( block.innerBlocks[ 0 ].attributes );
			expect( clonedBlock.innerBlocks[ 1 ].uid ).not.toBe( block.innerBlocks[ 1 ].uid );
			expect( clonedBlock.innerBlocks[ 1 ].attributes ).not.toBe( block.innerBlocks[ 1 ].attributes );
			expect( clonedBlock.innerBlocks[ 1 ].attributes ).toEqual( block.innerBlocks[ 1 ].attributes );
		} );
	} );

	describe( 'getPossibleBlockTransformations()', () => {
		it( 'should should show as available a simple "from" transformation"', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
		} );

		it( 'should show as available a simple "to" transformation"', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/text-block' );
		} );

		it( 'should not show a transformation if multiple blocks are passed and the transformation is not multi block (for a "from" transform)', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block1 = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const block2 = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block1, block2 ] );

			expect( availableBlocks ).toEqual( [] );
		} );

		it( 'should not show a transformation if multiple blocks are passed and the transformation is not multi block (for a "to" transform)', () => {
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/updated-text-block' ],
						transform: noop,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );

			const block1 = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const block2 = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block1, block2 ] );

			expect( availableBlocks ).toEqual( [] );
		} );

		it( 'should show a transformation as available if multiple blocks are passed and the transformation accepts multiple blocks (for a "from" transform)', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMultiBlock: true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block1 = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const block2 = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block1, block2 ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
		} );

		it( 'should show a transformation as available if multiple blocks are passed and the transformation accepts multiple blocks (for a "to" transform)', () => {
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/updated-text-block' ],
						transform: noop,
						isMultiBlock: true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );

			const block1 = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const block2 = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block1, block2 ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
		} );

		it( 'should show multiple possible transformations', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMultiBlock: true,
					}, {
						type: 'block',
						blocks: [ 'core/another-text-block' ],
						transform: noop,
						isMultiBlock: true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );
			registerBlockType( 'core/another-text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 2 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/text-block' );
			expect( availableBlocks[ 1 ].name ).toBe( 'core/another-text-block' );
		} );

		it( 'should show multiple possible transformations when multiple blocks have a matching `from` transform', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMultiBlock: false,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/another-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMultiBlock: true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'another text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 2 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
			expect( availableBlocks[ 1 ].name ).toBe( 'core/another-text-block' );
		} );

		it( 'should show multiple possible transformations for a single `to` transform object with multiple block names', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block', 'core/another-text-block' ],
						transform: noop,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );
			registerBlockType( 'core/another-text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 2 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/text-block' );
			expect( availableBlocks[ 1 ].name ).toBe( 'core/another-text-block' );
		} );

		it( 'returns a single transformation for a "from" transform that has a `isMatch` function returning `true`', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMatch: () => true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
		} );

		it( 'returns no transformations for a "from" transform with a `isMatch` function returning `false`', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMatch: () => false,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'chicken',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toEqual( [] );
		} );

		it( 'returns a single transformation for a "to" transform that has a `isMatch` function returning `true`', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMatch: () => true,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toHaveLength( 1 );
			expect( availableBlocks[ 0 ].name ).toBe( 'core/text-block' );
		} );

		it( 'returns no transformations for a "to" transform with a `isMatch` function returning `false`', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMatch: () => false,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'ribs',
			} );

			const availableBlocks = getPossibleBlockTransformations( [ block ] );

			expect( availableBlocks ).toEqual( [] );
		} );

		it( 'for a non multiblock transform, the isMatch function receives the source block\'s attributes object as its first argument', () => {
			const isMatch = jest.fn();

			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMatch,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/updated-text-block', {
				value: 'ribs',
			} );

			getPossibleBlockTransformations( [ block ] );

			expect( isMatch ).toHaveBeenCalledWith( { value: 'ribs' } );
		} );

		it( 'for a multiblock transform, the isMatch function receives an array containing every source block\'s attributes as its first argument', () => {
			const isMatch = jest.fn();

			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: noop,
						isMultiBlock: true,
						isMatch,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const meatBlock = createBlock( 'core/updated-text-block', {
				value: 'ribs',
			} );

			const cheeseBlock = createBlock( 'core/updated-text-block', {
				value: 'halloumi',
			} );

			getPossibleBlockTransformations( [ meatBlock, cheeseBlock ] );

			expect( isMatch ).toHaveBeenCalledWith( [ { value: 'ribs' }, { value: 'halloumi' } ] );
		} );
	} );

	describe( 'switchToBlockType()', () => {
		it( 'should switch the blockType of a block using the "transform form"', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						type: 'block',
						blocks: [ 'core/text-block' ],
						transform: ( { value } ) => {
							return createBlock( 'core/updated-text-block', {
								value: 'chicken ' + value,
							} );
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toHaveLength( 1 );
			expect( transformedBlocks[ 0 ] ).toHaveProperty( 'uid' );
			expect( transformedBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
			expect( transformedBlocks[ 0 ].isValid ).toBe( true );
			expect( transformedBlocks[ 0 ].attributes ).toEqual( {
				value: 'chicken ribs',
			} );
		} );

		it( 'should switch the blockType of a block using the "transform to"', () => {
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/updated-text-block' ],
						transform: ( { value } ) => {
							return createBlock( 'core/updated-text-block', {
								value: 'chicken ' + value,
							} );
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'text-block',
			} );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toHaveLength( 1 );
			expect( transformedBlocks[ 0 ] ).toHaveProperty( 'uid' );
			expect( transformedBlocks[ 0 ].name ).toBe( 'core/updated-text-block' );
			expect( transformedBlocks[ 0 ].isValid ).toBe( true );
			expect( transformedBlocks[ 0 ].attributes ).toEqual( {
				value: 'chicken ribs',
			} );
		} );

		it( 'should return null if no transformation is found', () => {
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject transformations that return null', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
						transform: () => null,
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject transformations that return an empty array', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
						transform: () => [],
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject single transformations that do not include block types', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
						transform: ( { value } ) => {
							return {
								attributes: {
									value: 'chicken ' + value,
								},
							};
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject array transformations that do not include block types', () => {
			registerBlockType( 'core/updated-text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
						transform: ( { value } ) => {
							return [
								createBlock( 'core/updated-text-block', {
									value: 'chicken ' + value,
								} ),
								{
									attributes: {
										value: 'smoked ' + value,
									},
								},
							];
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/text-block', defaultBlockSettings );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject single transformations with unexpected block types', () => {
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						blocks: [ 'core/updated-text-block' ],
						transform: ( { value } ) => {
							return createBlock( 'core/text-block', {
								value: 'chicken ' + value,
							} );
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'text block',
			} );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toBeNull();
		} );

		it( 'should reject array transformations with unexpected block types', () => {
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						blocks: [ 'core/updated-text-block' ],
						transform: ( { value } ) => {
							return [
								createBlock( 'core/text-block', {
									value: 'chicken ' + value,
								} ),
								createBlock( 'core/text-block', {
									value: 'smoked ' + value,
								} ),
							];
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'text block',
			} );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			expect( transformedBlocks ).toEqual( null );
		} );

		it( 'should accept valid array transformations', () => {
			registerBlockType( 'core/updated-text-block', defaultBlockSettings );
			registerBlockType( 'core/text-block', {
				attributes: {
					value: {
						type: 'string',
					},
				},
				transforms: {
					to: [ {
						type: 'block',
						blocks: [ 'core/updated-text-block' ],
						transform: ( { value } ) => {
							return [
								createBlock( 'core/text-block', {
									value: 'chicken ' + value,
								} ),
								createBlock( 'core/updated-text-block', {
									value: 'smoked ' + value,
								} ),
							];
						},
					} ],
				},
				save: noop,
				category: 'common',
				title: 'text block',
			} );

			const block = createBlock( 'core/text-block', {
				value: 'ribs',
			} );

			const transformedBlocks = switchToBlockType( block, 'core/updated-text-block' );

			// Make sure the block UIDs are set as expected: the first
			// transformed block whose type matches the "destination" type gets
			// to keep the existing block's UID.
			expect( transformedBlocks ).toHaveLength( 2 );
			expect( transformedBlocks[ 0 ] ).toHaveProperty( 'uid' );
			expect( transformedBlocks[ 0 ].uid ).not.toBe( block.uid );
			expect( transformedBlocks[ 0 ].name ).toBe( 'core/text-block' );
			expect( transformedBlocks[ 0 ].isValid ).toBe( true );
			expect( transformedBlocks[ 0 ].attributes ).toEqual( {
				value: 'chicken ribs',
			} );
			expect( transformedBlocks[ 1 ].uid ).toBe( block.uid );
			expect( transformedBlocks[ 1 ] ).toHaveProperty( 'uid' );
			expect( transformedBlocks[ 1 ].name ).toBe( 'core/updated-text-block' );
			expect( transformedBlocks[ 1 ].isValid ).toBe( true );
			expect( transformedBlocks[ 1 ].attributes ).toEqual( {
				value: 'smoked ribs',
			} );
		} );
	} );

	describe( 'getBlockTransforms', () => {
		beforeEach( () => {
			registerBlockType( 'core/text-block', defaultBlockSettings );
			registerBlockType( 'core/transform-from-text-block-1', {
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
			registerBlockType( 'core/transform-from-text-block-2', {
				transforms: {
					from: [ {
						blocks: [ 'core/text-block' ],
					} ],
				},
				save: noop,
				category: 'common',
				title: 'updated text block',
			} );
		} );

		it( 'should return all block types of direction', () => {
			const transforms = getBlockTransforms( 'from' );

			expect( transforms ).toEqual( [
				{
					blocks: [ 'core/text-block' ],
					blockName: 'core/transform-from-text-block-1',
				},
				{
					blocks: [ 'core/text-block' ],
					blockName: 'core/transform-from-text-block-2',
				},
			] );
		} );

		it( 'should return empty array if no block type by name', () => {
			const transforms = getBlockTransforms( 'from', 'core/not-exists' );

			expect( transforms ).toEqual( [] );
		} );

		it( 'should return empty array if no defined transforms', () => {
			const transforms = getBlockTransforms( 'to', 'core/transform-from-text-block-1' );

			expect( transforms ).toEqual( [] );
		} );

		it( 'should return single block type transforms of direction', () => {
			const transforms = getBlockTransforms( 'from', 'core/transform-from-text-block-1' );

			expect( transforms ).toEqual( [
				{
					blocks: [ 'core/text-block' ],
					blockName: 'core/transform-from-text-block-1',
				},
			] );
		} );
	} );

	describe( 'findTransform', () => {
		const transforms = [
			{
				blocks: [ 'core/text-block' ],
				priority: 20,
				blockName: 'core/transform-from-text-block-1',
			},
			{
				blocks: [ 'core/text-block' ],
				blockName: 'core/transform-from-text-block-3',
				priority: 5,
			},
			{
				blocks: [ 'core/text-block' ],
				blockName: 'core/transform-from-text-block-2',
			},
		];

		it( 'should return highest priority (lowest numeric value) transform', () => {
			const transform = findTransform( transforms, () => true );

			expect( transform ).toEqual( {
				blocks: [ 'core/text-block' ],
				blockName: 'core/transform-from-text-block-3',
				priority: 5,
			} );
		} );

		it( 'should return null if no matching transform', () => {
			const transform = findTransform( transforms, () => false );

			expect( transform ).toBe( null );
		} );
	} );
} );
