/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { productVariationUpdated } from '../actions';
import { variationUpdated } from '../reducer';

describe( 'reducer', () => {
	describe( '#variationUpdated', () => {
		test( 'should store a new variation via update', () => {
			const variation1 = {
				id: 202,
				attributes: [
					{
						id: 9,
						option: 'Black',
					},
				],
			};
			const action = productVariationUpdated( 123, 66, variation1 );
			const state = variationUpdated( undefined, action );

			expect( state[ 66 ] ).to.eql( [ variation1 ] );
		} );

		test( 'should overwrite an existing variation via update', () => {
			const variation1Before = {
				id: 202,
				attributes: [
					{
						id: 9,
						option: 'Black',
					},
				],
			};

			const variation1After = {
				id: 202,
				attributes: [
					{
						id: 9,
						option: 'Red',
					},
				],
			};
			const actionBefore = productVariationUpdated( 123, 66, variation1Before );
			const actionAfter = productVariationUpdated( 123, 66, variation1After );

			const state1 = variationUpdated( undefined, actionBefore );
			const state2 = variationUpdated( state1, actionAfter );

			expect( state1[ 66 ] ).to.eql( [ variation1Before ] );
			expect( state2[ 66 ] ).to.eql( [ variation1After ] );
		} );

		test( 'should remove an existing variation if passed "undefined" for a variation', () => {
			const variation1Before = {
				id: 202,
				attributes: [
					{
						id: 9,
						option: 'Black',
					},
				],
			};

			const actionBefore = productVariationUpdated( 123, 66, variation1Before );
			const actionAfter = productVariationUpdated( 123, 66, 202 );

			const state1 = variationUpdated( undefined, actionBefore );
			const state2 = variationUpdated( state1, actionAfter );

			expect( state1[ 66 ] ).to.eql( [ variation1Before ] );
			expect( state2[ 66 ] ).to.eql( [] );
		} );
	} );
} );
