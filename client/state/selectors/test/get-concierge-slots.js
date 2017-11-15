/** @format */

/**
 * Internal dependencies
 */
import { getConciergeSlots } from '../';

describe( 'getConciergeSlots()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeSlots( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge shift state tree.', () => {
		const slots = [
			{ description: 'shift 1' },
			{ description: 'shift 2' },
			{ description: 'shift 3' },
		];
		const state = {
			concierge: {
				slots,
			},
		};

		expect( getConciergeSlots( state ) ).toEqual( slots );
	} );
} );
