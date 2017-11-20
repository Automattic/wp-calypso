/** @format */

/**
 * Internal dependencies
 */
import { getConciergeSlots } from '../';

describe( 'getConciergeSlots()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeSlots( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge slots state tree.', () => {
		const slots = [
			{ description: 'slot 1' },
			{ description: 'slot 2' },
			{ description: 'slot 3' },
		];
		const state = {
			concierge: {
				slots,
			},
		};

		expect( getConciergeSlots( state ) ).toEqual( slots );
	} );
} );
