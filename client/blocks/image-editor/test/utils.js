/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	meetsMinimumDimensions
} from 'blocks/image-editor/utils';

describe( 'ImageEditor Utils', ( ) => {
	describe( '#meetsMinimumDimensions()', ( ) => {
		it( 'should return true when height and width values exceed minimum dimensions', ( ) => {
			const minimumDimensionsConstants = {
				WIDTH: 25,
				HEIGHT: 25
			};
			expect(
				meetsMinimumDimensions( 100, 100, minimumDimensionsConstants )
			).to.be.true;
		} );

		it( 'should return false when height and width values are less than minimum dimensions', ( ) => {
			const minimumDimensionsConstants = {
				WIDTH: 100,
				HEIGHT: 100
			};
			expect(
				meetsMinimumDimensions( 99, 9, minimumDimensionsConstants )
			).to.be.false;
		} );

		it( 'should return false when either height or width values are not numbers', ( ) => {
			expect(
				meetsMinimumDimensions( undefined, 9 )
			).to.be.false;

			expect(
				meetsMinimumDimensions( 200, undefined )
			).to.be.false;
		} );
	} );
} );
