/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { local, mergeHandlers } from '../utils';

describe( 'Data Layer', () => {
	describe( '#local', () => {
		it( 'should wrap an action with the bypass flag', () => {
			const action = { type: 'ADD_SPLINE', id: 42 };
			const localAction = local( action );

			expect( localAction ).to.have.deep.property( 'meta.dataLayer.doBypass', true );
		} );

		it( 'should not destroy existing meta', () => {
			const action = {
				type: 'SHAVE_THE_WHALES',
				meta: {
					oceanName: 'ARCTIC',
					dataLayer: {
						forceRefresh: true,
					}
				}
			};
			const localAction = local( action );

			expect( localAction ).to.have.deep.property( 'meta.oceanName', 'ARCTIC' );
			expect( localAction ).to.have.deep.property( 'meta.dataLayer.forceRefresh', true );
		} );
	} );

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
