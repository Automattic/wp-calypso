/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { mergeHandlers } from '../utils';

describe( 'Data Layer', () => {
	describe( '#mergeHandlers', () => {
		const inc = a => a + 1;
		const triple = a => a * 3;
		const action = 'DO_MATH';
		const first = { [ action ]: [ inc ] };
		const second = { [ action ]: [ triple ] };

		it( 'should pass through a single handler', () => {
			expect( mergeHandlers( first ) ).to.equal( first );
		} );

		it( 'should combine lists of handlers for different action types', () => {
			const merged = mergeHandlers(
				{ INCREMENT: [ inc ] },
				{ TRIPLE: [ triple ] },
			);

			expect( merged ).to.eql( {
				INCREMENT: [ inc ],
				TRIPLE: [ triple ],
			} );
		} );

		it( 'should combine lists of handlers for the same action type', () => {
			const merged = mergeHandlers( first, second );

			expect( merged[ action ] ).to.eql( [ inc, triple ] );
		} );
	} );
} );
