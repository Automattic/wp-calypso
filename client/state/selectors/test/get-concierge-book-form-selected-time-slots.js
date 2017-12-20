/** @format */

/**
 * Internal dependencies
 */
import { getConciergeBookFormSelectedTimeSlots } from 'state/selectors';

describe( 'getConciergeBookFormSelectedTimeSlots()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeBookFormSelectedTimeSlots( {} ) ).toBeNull();
	} );

	test( 'should return the items field under the concierge book status from state tree.', () => {
		const bookForm = {
			selectedTimeSlots: [ new Date() ],
		};

		const state = {
			concierge: {
				bookForm,
			},
		};

		expect( getConciergeBookFormSelectedTimeSlots( state ) ).toEqual( bookForm.selectedTimeSlots );
	} );
} );
