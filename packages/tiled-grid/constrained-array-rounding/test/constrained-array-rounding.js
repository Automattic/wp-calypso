/** @format */

/**
 * Internal dependencies
 */
import { getRoundedConstrainedArray } from '../constrained-array-rounding';

describe( 'getRoundedConstrainedArray', () => {
	test( 'Round floats to integers that fit the row', () => {
		const rounded = getRoundedConstrainedArray( [ 427.33333333333337, 212.66666666666669 ], 640 );
		expect( rounded ).toBe( [ 427, 213 ] );
	} );

	test( 'No changes in integers that fit the row', () => {
		const rounded = getRoundedConstrainedArray( [ 320, 320 ], 640 );
		expect( rounded ).toBe( [ 320, 320 ] );
	} );
} );
