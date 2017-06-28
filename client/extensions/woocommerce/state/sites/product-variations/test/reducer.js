/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	variationUpdated,
} from '../reducer';

import {
	productVariationUpdated,
} from '../actions';

describe( 'reducer', () => {
	describe( '#variationUpdated', () => {
		it( 'should store a new variation via update', () => {
			const variation1 = {
				id: { placeholder: 'productVariation_1' },
				attributes: [
					{
						id: 9,
						option: 'Black',
					}
				]
			};
			const action = productVariationUpdated( 123, 66, variation1 );

			const state = variationUpdated( undefined, action );

			expect( state.variations ).to.eql( [ variation1 ] );
		} );

		it( 'should overwrite an existing variation via update', () => {
			const variation1Before = {
				id: { placeholder: 'productVariation_1' },
				attributes: [
					{
						id: 9,
						option: 'Black',
					}
				]
			};

			const variation1After = {
				id: { placeholder: 'productVariation_1' },
				attributes: [
					{
						id: 9,
						option: 'Red',
					}
				]
			};
			const actionBefore = productVariationUpdated( 123, 66, variation1Before );
			const actionAfter = productVariationUpdated( 123, 66, variation1After );

			const state1 = variationUpdated( undefined, actionBefore );
			const state2 = variationUpdated( state1, actionAfter );

			expect( state1.variations ).to.eql( [ variation1Before ] );
			expect( state2.variations ).to.eql( [ variation1After ] );
		} );
	} );
} );

