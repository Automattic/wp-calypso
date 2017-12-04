/** @format */

/**
 * Internal dependencies
 */
import { getConciergeShifts } from 'state/selectors';

describe( 'getConciergeShifts()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeShifts( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge shift state tree.', () => {
		const shifts = [
			{ description: 'shift 1' },
			{ description: 'shift 2' },
			{ description: 'shift 3' },
		];
		const state = {
			concierge: {
				shifts,
			},
		};

		expect( getConciergeShifts( state ) ).toEqual( shifts );
	} );
} );
