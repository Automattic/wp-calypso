/** @format */

/**
 * Internal dependencies
 */
import { getConciergeBookFormStatus } from 'state/selectors';

describe( 'getConciergeBookForm()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeBookFormStatus( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge book status from state tree.', () => {
		const bookForm = {
			isBooking: true,
			status: 'booking',
		};

		const state = {
			concierge: {
				bookForm,
			},
		};

		expect( getConciergeBookFormStatus( state ) ).toEqual( bookForm.status );
	} );
} );
