/** @format */

/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from '../super';

describe( 'Jetpack_Tiled_Gallery_Shape', () => {
	test( 'constructor', () => {
		const images = [ {}, {} ];
		const instance = new Jetpack_Tiled_Gallery_Shape( images );

		expect( instance.images ).toBe( images );
		instance.images.map( ( img, i ) => expect( img ).toBe( images[ i ] ) );
		expect( instance.images_left ).toBe( 2 );
	} );

	describe( 'sum_ratios', () => {
		const vals = [ 3, 5, 7, 9, 13 ];
		let instance = beforeEach( () => {
			const images = vals.map( v => ( { ratio: v } ) );
			instance = new Jetpack_Tiled_Gallery_Shape( images );
		} );

		test( 'sums', () => {
			expect( instance.sum_ratios( 2 ) ).toBe( 3 + 5 );
			expect( instance.sum_ratios( vals.length ) ).toBe( 3 + 5 + 7 + 9 + 13 );
		} );
	} );
} );
