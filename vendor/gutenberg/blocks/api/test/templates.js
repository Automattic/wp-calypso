/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { createBlock } from '../factory';
import { getBlockTypes, unregisterBlockType, registerBlockType } from '../registration';
import { doBlocksMatchTemplate, synchronizeBlocksWithTemplate } from '../templates';

describe( 'templates', () => {
	beforeAll( () => {
		// Initialize the block store
		require( '../../store' );
	} );

	afterEach( () => {
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
	} );

	beforeEach( () => {
		registerBlockType( 'core/test-block', {
			attributes: {},
			save: noop,
			category: 'common',
			title: 'test block',
		} );

		registerBlockType( 'core/test-block-2', {
			attributes: {},
			save: noop,
			category: 'common',
			title: 'test block',
		} );
	} );

	describe( 'doBlocksMatchTemplate', () => {
		it( 'return true if for empty templates and blocks', () => {
			expect( doBlocksMatchTemplate() ).toBe( true );
		} );

		it( 'return true if the template matches the blocks', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2' ],
				[ 'core/test-block-2' ],
			];
			const blockList = [
				createBlock( 'core/test-block' ),
				createBlock( 'core/test-block-2' ),
				createBlock( 'core/test-block-2' ),
			];
			expect( doBlocksMatchTemplate( blockList, template ) ).toBe( true );
		} );

		it( 'return true if the template matches the blocks with nested blocks', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2', {}, [
					[ 'core/test-block' ],
				] ],
				[ 'core/test-block-2' ],
			];
			const blockList = [
				createBlock( 'core/test-block' ),
				createBlock( 'core/test-block-2', {}, [ createBlock( 'core/test-block' ) ] ),
				createBlock( 'core/test-block-2' ),
			];
			expect( doBlocksMatchTemplate( blockList, template ) ).toBe( true );
		} );

		it( 'return false if the template length doesn\'t match the blocks length', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2' ],
			];
			const blockList = [
				createBlock( 'core/test-block' ),
				createBlock( 'core/test-block-2' ),
				createBlock( 'core/test-block-2' ),
			];
			expect( doBlocksMatchTemplate( blockList, template ) ).toBe( false );
		} );

		it( 'return false if the nested template doesn\'t match the blocks', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2', {}, [
					[ 'core/test-block' ],
				] ],
				[ 'core/test-block-2' ],
			];
			const blockList = [
				createBlock( 'core/test-block' ),
				createBlock( 'core/test-block-2', {}, [ createBlock( 'core/test-block-2' ) ] ),
				createBlock( 'core/test-block-2' ),
			];
			expect( doBlocksMatchTemplate( blockList, template ) ).toBe( false );
		} );
	} );

	describe( 'synchronizeBlocksWithTemplate', () => {
		it( 'should create blocks for each template entry', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2' ],
				[ 'core/test-block-2' ],
			];
			const blockList = [];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toMatchObject( [
				{ name: 'core/test-block' },
				{ name: 'core/test-block-2' },
				{ name: 'core/test-block-2' },
			] );
		} );

		it( 'should create nested blocks', () => {
			const template = [
				[ 'core/test-block', {}, [
					[ 'core/test-block-2' ],
				] ],
			];
			const blockList = [];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toMatchObject( [
				{ name: 'core/test-block', innerBlocks: [
					{ name: 'core/test-block-2' },
				] },
			] );
		} );

		it( 'should append blocks if more blocks in the template', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2' ],
				[ 'core/test-block-2' ],
			];

			const block1 = createBlock( 'core/test-block' );
			const block2 = createBlock( 'core/test-block-2' );
			const blockList = [ block1, block2 ];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toMatchObject( [
				block1,
				block2,
				{ name: 'core/test-block-2' },
			] );
		} );

		it( 'should replace blocks if not matching blocks are found', () => {
			const template = [
				[ 'core/test-block' ],
				[ 'core/test-block-2' ],
				[ 'core/test-block-2' ],
			];

			const block1 = createBlock( 'core/test-block' );
			const block2 = createBlock( 'core/test-block' );
			const blockList = [ block1, block2 ];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toMatchObject( [
				block1,
				{ name: 'core/test-block-2' },
				{ name: 'core/test-block-2' },
			] );
		} );

		it( 'should return original blocks if no template provided', () => {
			let template;
			const block1 = createBlock( 'core/test-block' );
			const block2 = createBlock( 'core/test-block' );
			const blockList = [ block1, block2 ];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toBe( blockList );
		} );

		it( 'should remove blocks if extra blocks are found', () => {
			const template = [
				[ 'core/test-block' ],
			];

			const block1 = createBlock( 'core/test-block' );
			const block2 = createBlock( 'core/test-block' );
			const blockList = [ block1, block2 ];
			expect( synchronizeBlocksWithTemplate( blockList, template ) ).toEqual( [
				block1,
			] );
		} );
	} );
} );
