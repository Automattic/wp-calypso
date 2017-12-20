/** @format */

/**
 * Internal dependencies
 */
import { getConciergeBookForm } from 'state/selectors';

describe( 'getConciergeBookForm()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeBookForm( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge book form state tree.', () => {
		const bookForm = {
			isBooking: true,
			status: 'booking',
		};

		const state = {
			concierge: {
				bookForm,
			},
		};

		expect( getConciergeBookForm( state ) ).toEqual( bookForm );
	} );
} );
