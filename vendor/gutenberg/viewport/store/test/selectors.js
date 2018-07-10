/**
 * Internal dependencies
 */
import { isViewportMatch } from '../selectors';

describe( 'selectors', () => {
	describe( 'isViewportMatch()', () => {
		it( 'should return with omitted operator defaulting to >=', () => {
			const result = isViewportMatch( {
				'>= wide': true,
				'< wide': false,
			}, 'wide' );

			expect( result ).toBe( true );
		} );

		it( 'should return with known query value', () => {
			const result = isViewportMatch( {
				'>= wide': false,
				'< wide': true,
			}, '< wide' );

			expect( result ).toBe( true );
		} );
	} );
} );
