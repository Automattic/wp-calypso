/**
 * Internal dependencies
 */
import { getBlockMoverDescription, getMultiBlockMoverDescription } from '../mover-description';

describe( 'block mover', () => {
	const dirUp = -1,
		dirDown = 1;

	describe( 'getBlockMoverDescription', () => {
		const type = 'TestType';

		it( 'Should generate a title for the first item moving up', () => {
			expect( getBlockMoverDescription(
				1,
				type,
				0,
				true,
				false,
				dirUp,
			) ).toBe(
				`Block ${ type } is at the beginning of the content and can’t be moved up`
			);
		} );

		it( 'Should generate a title for the last item moving down', () => {
			expect( getBlockMoverDescription(
				1,
				type,
				3,
				false,
				true,
				dirDown,
			) ).toBe( `Block ${ type } is at the end of the content and can’t be moved down` );
		} );

		it( 'Should generate a title for the second item moving up', () => {
			expect( getBlockMoverDescription(
				1,
				type,
				1,
				false,
				false,
				dirUp,
			) ).toBe( `Move ${ type } block from position 2 up to position 1` );
		} );

		it( 'Should generate a title for the second item moving down', () => {
			expect( getBlockMoverDescription(
				1,
				type,
				1,
				false,
				false,
				dirDown,
			) ).toBe( `Move ${ type } block from position 2 down to position 3` );
		} );

		it( 'Should generate a title for the only item in the list', () => {
			expect( getBlockMoverDescription(
				1,
				type,
				0,
				true,
				true,
				dirDown,
			) ).toBe( `Block ${ type } is the only block, and cannot be moved` );
		} );
	} );

	describe( 'getMultiBlockMoverDescription', () => {
		it( 'Should generate a title moving multiple blocks up', () => {
			expect( getMultiBlockMoverDescription(
				4,
				1,
				false,
				true,
				dirUp,
			) ).toBe( 'Move 4 blocks from position 2 up by one place' );
		} );

		it( 'Should generate a title moving multiple blocks down', () => {
			expect( getMultiBlockMoverDescription(
				4,
				0,
				true,
				false,
				dirDown,
			) ).toBe( 'Move 4 blocks from position 1 down by one place' );
		} );

		it( 'Should generate a title for a selection of blocks at the top', () => {
			expect( getMultiBlockMoverDescription(
				4,
				1,
				true,
				true,
				dirUp,
			) ).toBe( 'Blocks cannot be moved up as they are already at the top' );
		} );

		it( 'Should generate a title for a selection of blocks at the bottom', () => {
			expect( getMultiBlockMoverDescription(
				4,
				2,
				false,
				true,
				dirDown,
			) ).toBe( 'Blocks cannot be moved down as they are already at the bottom' );
		} );
	} );
} );
